import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Chat, User, Workspace } from '@prisma/client'
import { appConfigVersionUpdateForDefaultPostService } from '../appConfigVersionUpdateForDefaultPost.service'

interface SubjectPayload {
  model: string
}

const subject = async (
  workspaceId: string,
  userId: string,
  chatId: string,
  payload: SubjectPayload,
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await appConfigVersionUpdateForDefaultPostService(prisma, uowContext, {
    chatId,
    model: payload.model,
  })
}

describe('appConfigVersionUpdateForDefaultPostService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let chat: Chat

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    app = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      isDefault: true,
    })
    const appConfigVersion = await prisma.appConfigVersion.findFirstOrThrow({
      where: {
        appId: app.id,
      },
    })
    chat = await ChatFactory.create(prisma, {
      appId: app.id,
      authorId: user.id,
      appConfigVersionId: appConfigVersion.id,
    })
  })

  it('updates the appConfigVersion linked to the chat', async () => {
    await subject(workspace.id, user.id, chat.id, {
      model: 'fake_model',
    })
    const dbAppConfigVersion = await prisma.appConfigVersion.findMany({
      where: {
        appId: app.id,
        chats: {
          some: {
            id: chat.id,
          },
        },
      },
    })
    expect(dbAppConfigVersion.length).toBe(1)
    expect(dbAppConfigVersion[0]!.model).toBe('fake_model')
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, chat.id, {
      model: 'fake_model',
    })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when the post linked to the chat is not the default post', () => {
    beforeEach(async () => {
      await prisma.app.update({
        where: { id: app.id },
        data: { isDefault: false },
      })
    })

    it('throws if it is not a default post', async () => {
      await expect(
        subject(workspace.id, user.id, chat.id, {
          model: 'fake_model',
        }),
      ).rejects.toThrow()
    })
  })
})
