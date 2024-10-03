import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppConfigVersionFactory } from '@/server/testing/factories/AppConfigVersionFactory'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { MessageFactory } from '@/server/testing/factories/MessageFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type {
  App,
  AppConfigVersion,
  Chat,
  User,
  Workspace,
} from '@prisma/client'
import { Promise } from 'bluebird'
import { getApplicableAppConfigToChatService } from '../getApplicableAppConfigToChat.service'

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
  return await getApplicableAppConfigToChatService(prisma, uowContext, payload)
}

describe('getApplicableAppConfigToChat', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let chat: Chat
  let otherAppConfigVersion: AppConfigVersion

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
    await Promise.mapSeries(
      Array.from({ length: 3 }),
      async () =>
        await MessageFactory.create(prisma, {
          chatId: chat.id,
        }),
    )
    otherAppConfigVersion = await AppConfigVersionFactory.create(prisma, {
      appId: app.id,
    })
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

  describe('when the chat has a appConfigVersionId', () => {
    beforeEach(async () => {
      await prisma.chat.update({
        where: { id: chat.id },
        data: { appConfigVersionId: otherAppConfigVersion.id },
      })
    })

    it('returns the one linked to the chat', async () => {
      const result = await subject(workspace.id, user.id, { chatId: chat.id })
      expect(result.id).toEqual(otherAppConfigVersion.id)
    })

    it('returns the linked system messages', async () => {
      const result = await subject(workspace.id, user.id, { chatId: chat.id })

      const dbMessages = await prisma.message.findMany({
        where: {
          appConfigVersionId: otherAppConfigVersion.id,
        },
      })

      expect(dbMessages).toHaveLength(1)
      expect(result.messages[0]!.id).toBe(dbMessages[0]!.id)
    })
  })
  describe('when the chat does not have a appConfigVersionId', () => {
    it('returns the latest one created for the app', async () => {
      const result = await subject(workspace.id, user.id, {
        chatId: chat.id,
      })
      expect(result.id).toEqual(otherAppConfigVersion.id)
    })
  })
})
