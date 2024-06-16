import { AppEngineType } from '@/components/apps/appsTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, User, Workspace } from '@prisma/client'
import { appUpdateService } from '../appUpdate.service'

const subject = async (
  workspaceId: string,
  userId: string,
  appId: string,
  payload: {
    title?: string | null
    emoji?: string | null
    engineType?: AppEngineType
  } = {},
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await appUpdateService(prisma, uowContext, { ...payload, appId })
}

describe('appUpdateService', () => {
  let workspace: Workspace
  let user: User
  let app: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      title: 'A title',
    })
  })

  it('updates the app', async () => {
    const appInDbBefore = await prisma.app.findFirstOrThrow({
      where: {
        id: app.id,
      },
    })
    expect(appInDbBefore.title).toBe('A title')

    await subject(workspace.id, user.id, app.id, { title: 'A new title' })

    const appInDb = await prisma.app.findFirstOrThrow({
      where: {
        id: app.id,
      },
    })

    expect(appInDb.title).toBe('A new title')
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, app.id, { title: 'A new title' })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Update,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when the appId is the defaultApp for the workspace', () => {
    let defaultApp: App

    beforeEach(async () => {
      defaultApp = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        isDefault: true,
      })
    })

    it('throws an error', async () => {
      await expect(
        subject(workspace.id, user.id, defaultApp.id),
      ).rejects.toThrow()
    })
  })

  describe('engineType updates', () => {
    describe('when engineType is not set', () => {
      it('updates the app', async () => {
        const appInDbBefore = await prisma.app.findFirstOrThrow({
          where: {
            id: app.id,
          },
        })
        expect(appInDbBefore.engineType).toBe(null)

        await subject(workspace.id, user.id, app.id, {
          engineType: AppEngineType.Custom,
        })

        const appInDb = await prisma.app.findFirstOrThrow({
          where: {
            id: app.id,
          },
        })

        expect(appInDb.engineType).toBe(AppEngineType.Custom)
      })
    })

    describe('when engineType is set', () => {
      beforeEach(async () => {
        await prisma.app.update({
          where: {
            id: app.id,
          },
          data: {
            engineType: AppEngineType.Custom,
          },
        })
      })
      it('throws when trying to update it', async () => {
        await expect(
          subject(workspace.id, user.id, app.id, {
            engineType: AppEngineType.Custom,
          }),
        ).rejects.toThrow('GPT Engine cannot be updated once set')
      })
    })
  })
})
