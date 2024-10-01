import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Chat, User, Workspace } from '@prisma/client'
import { getChatByIdService } from '../getChatById.service'

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
  return await getChatByIdService(prisma, uowContext, payload)
}

describe('getChatByIdService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let chat: Chat

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
  })

  it('gets the chat', async () => {
    const result = await subject(workspace.id, user.id, { chatId: chat.id })

    expect(result.id).toEqual(chat.id)
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
})
