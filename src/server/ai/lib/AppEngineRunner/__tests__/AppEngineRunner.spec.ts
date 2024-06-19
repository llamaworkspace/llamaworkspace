import { AppEngineType } from '@/components/apps/appsTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { MessageFactory } from '@/server/testing/factories/MessageFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { Author } from '@/shared/aiTypesAndMappers'
import type { App, Chat, Message, User, Workspace } from '@prisma/client'
import {
  AbstractAppEngine,
  type AppEngineParams,
} from '../../AbstractAppEngine'
import { AppEnginePayloadBuilder } from '../AppEnginePayloadBuilder'
import { AppEngineRunner } from '../AppEngineRunner'

type MockAppEngineKvs = {
  name: string
}

export class MockAppEngine extends AbstractAppEngine {
  getName(): string {
    return 'default'
  }

  async run(params: AppEngineParams<MockAppEngineKvs>) {
    const mockStream = new ReadableStream<unknown>({
      start(controller) {
        controller.enqueue({ data: 'mockData' })
        controller.close()
      },
    })

    return Promise.resolve(mockStream)
  }
}

const subject = async (
  appEngines: AbstractAppEngine[],
  workspaceId: string,
  userId: string,
  chatId: string,
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  const appEngineRunner = new AppEngineRunner(prisma, appEngines, context)
  return await appEngineRunner.call(chatId)
}

describe('AppEngineRunner', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let chat: Chat
  let firstUserMessage: Message
  let firstAssistantMessage: Message
  let mockAppEngine: AbstractAppEngine

  beforeEach(() => {
    mockAppEngine = new MockAppEngine()
  })

  beforeEach(async () => {
    jest.clearAllMocks()
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      engineType: AppEngineType.Default,
    })

    chat = await ChatFactory.create(prisma, {
      appId: app.id,
      authorId: user.id,
    })
    firstUserMessage = await MessageFactory.create(prisma, {
      author: Author.User,
      message: 'hello',
      chatId: chat.id,
    })
    firstAssistantMessage = await MessageFactory.create(prisma, {
      author: Author.Assistant,
      message: null,
      chatId: chat.id,
    })
  })

  describe('call', () => {
    describe('when engineType is not set', () => {
      it('throws an error', async () => {
        const otherApp = await AppFactory.create(prisma, {
          userId: user.id,
          workspaceId: workspace.id,
          engineType: null,
        })
        const otherChat = await ChatFactory.create(prisma, {
          appId: otherApp.id,
          authorId: user.id,
        })
        await expect(
          subject([mockAppEngine], workspace.id, user.id, otherChat.id),
        ).rejects.toThrow('engineType is not yet set')
      })
    })

    describe('when engineType is not default', () => {
      it('throws an error', async () => {
        const otherApp = await AppFactory.create(prisma, {
          userId: user.id,
          workspaceId: workspace.id,
          engineType: AppEngineType.Custom,
        })
        const otherChat = await ChatFactory.create(prisma, {
          appId: otherApp.id,
          authorId: user.id,
        })
        await expect(
          subject([mockAppEngine], workspace.id, user.id, otherChat.id),
        ).rejects.toThrow('non-default engineType is not yet supported')
      })
    })

    it('builds the payload using the AppEnginePayloadBuilder class', async () => {
      const spy = jest.spyOn(AppEnginePayloadBuilder.prototype, 'call')

      await subject([mockAppEngine], workspace.id, user.id, chat.id)
      expect(spy).toHaveBeenCalledWith(chat.id)
    })

    it('calls the underlying engine', async () => {
      const runMock = jest.spyOn(mockAppEngine, 'run').mockResolvedValueOnce(
        new ReadableStream<unknown>({
          start(controller) {
            controller.enqueue({ data: 'testData' })
            controller.close()
          },
        }),
      )
      await subject([mockAppEngine], workspace.id, user.id, chat.id)
      const appConfigVersion = await prisma.appConfigVersion.findFirstOrThrow({
        where: {
          appId: app.id,
        },
      })

      expect(runMock).toHaveBeenCalledWith(
        {
          chat,
          app,
          appConfigVersion: {
            ...appConfigVersion,
            systemMessage: null,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            messages: expect.arrayContaining([expect.objectContaining({})]),
          },
          messages: [
            {
              role: Author.User,
              content: firstUserMessage.message,
            },
          ],
        },
        {
          /* eslint-disable @typescript-eslint/no-unsafe-assignment */
          onToken: expect.any(Function),
          onError: expect.any(Function),
          onEnd: expect.any(Function),
          /* eslint-enable @typescript-eslint/no-unsafe-assignment */
        },
      )
    })
  })
})
