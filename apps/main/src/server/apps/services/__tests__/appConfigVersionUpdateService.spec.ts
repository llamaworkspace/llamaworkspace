import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, AppConfigVersion, User, Workspace } from '@prisma/client'
import { appConfigVersionUpdateService } from '../appConfigVersionUpdate.service'

interface SubjectPayload {
  description?: string | null
  systemMessage?: string
  model?: string
}

const subject = async (
  workspaceId: string,
  userId: string,
  appConfigVersionId: string,
  payload: SubjectPayload = {},
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await appConfigVersionUpdateService(prisma, uowContext, {
    ...payload,
    id: appConfigVersionId,
  })
}

describe('appConfigVersionUpdateService', () => {
  let workspace: Workspace
  let user: User
  let app: App & { appConfigVersions: AppConfigVersion[] }
  let appConfigVersion: AppConfigVersion

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    const _app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      title: 'A title',
    })
    app = await prisma.app.findFirstOrThrow({
      where: {
        id: _app.id,
      },
      include: {
        appConfigVersions: true,
      },
    })

    appConfigVersion = app.appConfigVersions[0]!
  })

  it('updates the appConfigVersion', async () => {
    const result = await subject(workspace.id, user.id, appConfigVersion.id, {
      description: 'A new description',
    })

    expect(result.description).toBe('A new description')
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, appConfigVersion.id, {
      description: 'A new description',
    })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Update,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when there are chats using the configversion', () => {
    beforeEach(async () => {
      await ChatFactory.create(prisma, {
        appId: app.id,
        authorId: user.id,
        appConfigVersionId: appConfigVersion.id,
      })
    })

    it('creates a new appConfigVersion', async () => {
      expect(
        await prisma.appConfigVersion.count({
          where: {
            appId: app.id,
          },
        }),
      ).toBe(1)

      await subject(workspace.id, user.id, appConfigVersion.id, {
        description: 'A new description',
      })

      expect(
        await prisma.appConfigVersion.count({
          where: {
            appId: app.id,
          },
        }),
      ).toBe(2)
    })
  })

  describe('when description is null', () => {
    it('updates the appConfigVersion', async () => {
      await prisma.appConfigVersion.update({
        where: {
          id: appConfigVersion.id,
        },
        data: {
          description: 'A description',
        },
      })

      const result = await subject(workspace.id, user.id, appConfigVersion.id, {
        description: null,
      })

      expect(result.description).toBeNull()
    })
  })

  describe('when systemMessage is provided', () => {
    it('updates the system message', async () => {
      const appConfigVersionInDbBefore =
        await prisma.appConfigVersion.findFirstOrThrow({
          where: {
            id: appConfigVersion.id,
          },
          include: {
            messages: true,
          },
        })

      expect(appConfigVersionInDbBefore.messages[0]!.message).not.toBe(
        'A new system message',
      )

      await subject(workspace.id, user.id, appConfigVersion.id, {
        systemMessage: 'A new system message',
      })
      const appConfigVersionInDb =
        await prisma.appConfigVersion.findFirstOrThrow({
          where: {
            id: appConfigVersion.id,
          },
          include: {
            messages: true,
          },
        })

      expect(appConfigVersionInDb.messages[0]!.message).toBe(
        'A new system message',
      )
    })
  })

  describe('when the app is the default one', () => {
    beforeEach(async () => {
      await prisma.app.update({
        where: {
          id: app.id,
        },
        data: {
          isDefault: true,
        },
      })
    })
    it('throws an error', async () => {
      await expect(
        subject(workspace.id, user.id, appConfigVersion.id, {
          description: 'A new description',
        }),
      ).rejects.toThrow()
    })
  })
})
