import { AppEngineType } from '@/components/apps/appsTypes'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { MessageFactory } from '@/server/testing/factories/MessageFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { Author } from '@/shared/aiTypesAndMappers'
import type { App, Chat, User, Workspace } from '@prisma/client'
import {
  AbstractAppEngine,
  type AppEngineParams,
} from '../../AbstractAppEngine'
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
  userId: string,
  chatId: string,
) => {
  const appEngineRunner = new AppEngineRunner(prisma, appEngines)
  return await appEngineRunner.call(userId, chatId)
}

describe('AppEngineRunner', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let chat: Chat
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
    await MessageFactory.create(prisma, {
      author: Author.User,
      message: 'hello',
      chatId: chat.id,
    })
    await MessageFactory.create(prisma, {
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
          subject([mockAppEngine], user.id, otherChat.id),
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
          subject([mockAppEngine], user.id, otherChat.id),
        ).rejects.toThrow('non-default engineType is not yet supported')
      })
    })

    it('calls engine.run', async () => {
      const runMock = jest.spyOn(mockAppEngine, 'run').mockResolvedValueOnce(
        new ReadableStream<unknown>({
          start(controller) {
            controller.enqueue({ data: 'testData' })
            controller.close()
          },
        }),
      )
      await subject([mockAppEngine], user.id, chat.id)
      expect(runMock).toHaveBeenCalled()
    })
  })
})
