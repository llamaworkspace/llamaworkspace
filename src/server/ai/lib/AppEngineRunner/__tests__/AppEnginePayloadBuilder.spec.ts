import { AppEngineType } from '@/components/apps/appsTypes'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { MessageFactory } from '@/server/testing/factories/MessageFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { Author } from '@/shared/aiTypesAndMappers'
import type { App, Chat, User, Workspace } from '@prisma/client'
import { AppEnginePayloadBuilder } from '../AppEnginePayloadBuilder'

const subject = async (chatId: string) => {
  const appEnginePayloadBuilder = new AppEnginePayloadBuilder(prisma)
  return await appEnginePayloadBuilder.call(chatId)
}

describe('AppEnginePayloadBuilder', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let chat: Chat

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
      author: Author.System,
      message: 'you are a helpful assistant',
      chatId: chat.id,
    })
    await MessageFactory.create(prisma, {
      author: Author.User,
      message: 'this is a question',
      chatId: chat.id,
    })
    await MessageFactory.create(prisma, {
      author: Author.Assistant,
      message: 'this is a 1st response',
      chatId: chat.id,
    })
    await MessageFactory.create(prisma, {
      author: Author.User,
      message: 'this is the followup question',
      chatId: chat.id,
    })
    await MessageFactory.create(prisma, {
      author: Author.Assistant,
      message: null,
      chatId: chat.id,
    })
  })

  describe('call', () => {
    describe('messages response', () => {
      it('returns all the prepared messages for the chat, in sorted order', async () => {
        const { messages } = await subject(chat.id)
        expect(messages).toHaveLength(4)
        expect(messages[0]).toEqual({
          role: Author.System,
          content: 'you are a helpful assistant',
        })
        expect(messages[1]).toEqual({
          role: Author.User,
          content: 'this is a question',
        })
        expect(messages[2]).toEqual({
          role: Author.Assistant,
          content: 'this is a 1st response',
        })
        expect(messages[3]).toEqual({
          role: Author.User,
          content: 'this is the followup question',
        })
      })
    })
  })
})
