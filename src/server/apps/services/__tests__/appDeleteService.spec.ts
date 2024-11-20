import { enqueueJob } from '@/hatchet/hatchet-enqueue'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, User, Workspace } from '@prisma/client'
import { appDeleteService } from '../appDelete.service'

jest.mock('@/hatchet/hatchet-enqueue.ts', () => {
  return { enqueueJob: jest.fn() }
})

const subject = async (workspaceId: string, userId: string, appId: string) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await appDeleteService(prisma, uowContext, { appId })
}

describe('appDeleteService', () => {
  let workspace: Workspace
  let user: User
  let app: App

  beforeEach(async () => {
    jest.clearAllMocks()
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  it('enqueues the app for deletion', async () => {
    await subject(workspace.id, user.id, app.id)
    /* eslint-disable-next-line @typescript-eslint/unbound-method*/
    expect(enqueueJob).toHaveBeenCalledWith('delete-app', {
      userId: user.id,
      appId: app.id,
    })
  })

  it('deletes the app', async () => {
    const appInDbBefore = await prisma.app.findFirst({
      where: {
        id: app.id,
      },
    })
    expect(appInDbBefore).not.toBeNull()

    await subject(workspace.id, user.id, app.id)

    const appInDb = await prisma.app.findFirst({
      where: {
        id: app.id,
      },
    })

    expect(appInDb!.markAsDeletedAt).toBeInstanceOf(Date)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, app.id)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Delete,
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
})
