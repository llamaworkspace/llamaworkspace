import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Chat, User, Workspace } from '@prisma/client'
import { updateChatService } from '../updateChat.service'

const subject = async (
  workspaceId: string,
  userId: string,
  chatId: string,
  payload: { title: string },
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await updateChatService(prisma, uowContext, { ...payload, id: chatId })
}

describe('updateChatService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let chat: Chat

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    chat = await ChatFactory.create(prisma, {
      appId: app.id,
      authorId: user.id,
    })
  })

  it('updates the chat title', async () => {
    const dbChatBefore = await prisma.chat.findFirstOrThrow({
      where: {
        app: {
          id: app.id,
        },
      },
    })
    expect(dbChatBefore.title).not.toEqual('new title')

    await subject(workspace.id, user.id, chat.id, {
      title: 'new title',
    })

    const dbChat = await prisma.chat.findFirstOrThrow({
      where: {
        app: {
          id: app.id,
        },
      },
    })
    expect(dbChat.title).toEqual('new title')
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, chat.id, {
      title: 'new title',
    })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })
})
