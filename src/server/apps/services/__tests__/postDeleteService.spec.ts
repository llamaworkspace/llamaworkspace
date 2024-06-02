import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, User, Workspace } from '@prisma/client'
import { postDeleteService } from '../postDelete.service'

const subject = async (workspaceId: string, userId: string, appId: string) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await postDeleteService(prisma, uowContext, { appId })
}

describe('postDeleteService', () => {
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
    })
  })

  it('deletes the app', async () => {
    const postInDbBefore = await prisma.app.findFirst({
      where: {
        id: app.id,
      },
    })
    expect(postInDbBefore).not.toBeNull()

    await subject(workspace.id, user.id, app.id)

    const postInDb = await prisma.app.findFirst({
      where: {
        id: app.id,
      },
    })

    expect(postInDb).toBeNull()
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
