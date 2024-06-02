import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { createMessageService } from '@/server/chats/services/createMessage.service'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { Author } from '@/shared/aiTypesAndMappers'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Chat, User, Workspace } from '@prisma/client'

const subject = async (
  workspaceId: string,
  userId: string,
  payload: { chatId: string; author: Author; message?: string },
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await createMessageService(prisma, uowContext, payload)
}

describe('createMessageService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let chat: Chat

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    app = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
    chat = await ChatFactory.create(prisma, {
      authorId: user.id,
      postId: app.id,
    })
  })

  it('creates a new message', async () => {
    const payload = {
      chatId: chat.id,
      author: Author.User,
      message: 'Hello, world!',
    }
    await subject(workspace.id, user.id, payload)

    const messages = await prisma.message.findMany({
      where: {
        chatId: chat.id,
      },
    })
    expect(messages.length).toBe(1)
    expect(messages[0]!).toMatchObject({
      chatId: chat.id,
      message: 'Hello, world!',
      author: Author.User,
    })
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )
    const payload = {
      chatId: chat.id,
      author: Author.User,
      message: 'Hello, world!',
    }
    await subject(workspace.id, user.id, payload)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })

  it('does not set message when author is Assistant', async () => {
    const payload = {
      chatId: chat.id,
      author: Author.Assistant,
      message: 'Hello, world!',
    }
    await subject(workspace.id, user.id, payload)

    const message = await prisma.message.findFirstOrThrow({
      where: {
        chatId: chat.id,
      },
    })

    expect(message).toMatchObject({
      chatId: chat.id,
      message: null,
      author: Author.Assistant,
    })
  })
})
