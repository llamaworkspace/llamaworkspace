import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Chat, User, Workspace } from '@prisma/client'
import { deleteChatService } from '../deleteChat.service'

const subject = async (workspaceId: string, userId: string, chatId: string) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await deleteChatService(prisma, uowContext, { id: chatId })
}

describe('deleteChatService', () => {
  let workspace: Workspace
  let user: User
  let post: App
  let chat: Chat

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    chat = await ChatFactory.create(prisma, {
      postId: post.id,
      authorId: user.id,
    })
  })

  it('deletes the chat', async () => {
    const dbChatBefore = await prisma.chat.findFirstOrThrow({
      where: {
        app: {
          id: post.id,
        },
      },
    })
    expect(dbChatBefore).toBeDefined()

    await subject(workspace.id, user.id, chat.id)

    const dbChat = await prisma.chat.findFirst({
      where: {
        app: {
          id: post.id,
        },
      },
    })
    expect(dbChat).toBeNull()
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, chat.id)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })
})
