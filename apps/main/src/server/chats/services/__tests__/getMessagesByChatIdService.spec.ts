import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { MessageFactory } from '@/server/testing/factories/MessageFactory'
import { ShareTargetFactory } from '@/server/testing/factories/ShareTargetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { Author } from '@/shared/aiTypesAndMappers'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Chat, Message, User, Workspace } from '@prisma/client'
import { Promise } from 'bluebird'
import { getMessagesByChatIdService } from '../getMessagesByChatId.service'

const subject = async (
  workspaceId: string,
  userId: string,
  payload: { chatId: string },
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getMessagesByChatIdService(prisma, uowContext, payload)
}

describe('getMessagesByChatIdService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let chat: Chat
  let messages: Message[]

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
    chat = await ChatFactory.create(prisma, {
      authorId: user.id,
      appId: app.id,
    })
    messages = await Promise.mapSeries(
      Array.from({ length: 3 }),
      async () =>
        await MessageFactory.create(prisma, {
          chatId: chat.id,
        }),
    )
  })

  it('gets the messages in the right order', async () => {
    const result = await subject(workspace.id, user.id, { chatId: chat.id })

    expect(messages.length).toEqual(3)
    expect(result[2]!.id).toEqual(messages[2]!.id)
    expect(result[1]!.id).toEqual(messages[1]!.id)
    expect(result[0]!.id).toEqual(messages[0]!.id)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )
    await subject(workspace.id, user.id, { chatId: chat.id })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when the user has access to the app, but is not an author of the chat', () => {
    it('throws an error', async () => {
      const otherUser = await UserFactory.create(prisma, {
        workspaceId: workspace.id,
      })
      const share = await prisma.share.findFirstOrThrow({
        where: { appId: app.id },
      })

      await ShareTargetFactory.create(prisma, {
        shareId: share.id,
        userId: otherUser.id,
        sharerId: user.id,
      })

      await expect(
        subject(workspace.id, otherUser.id, { chatId: chat.id }),
      ).rejects.toThrow()
    })
  })

  describe('when there is a message with null content', () => {
    it('replaces null messages with "*Empty response*"', async () => {
      // Create a message with null content
      await MessageFactory.create(prisma, {
        chatId: chat.id,
        message: null,
        author: Author.Assistant,
      })

      const result = await subject(workspace.id, user.id, { chatId: chat.id })

      // Check if the null message is replaced with "*Empty response*"
      const emptyMessage = result.find(
        (msg) => msg.message === '*Empty response*',
      )
      expect(emptyMessage).toBeTruthy()

      // Ensure other messages are not affected
      const nonEmptyMessages = result.filter(
        (msg) => msg.message !== '*Empty response*',
      )
      expect(nonEmptyMessages.length).toBe(3)
      nonEmptyMessages.forEach((msg) => {
        expect(msg.message).not.toBeNull()
        expect(msg.message).not.toBe('*Empty response*')
      })
    })
  })
})
