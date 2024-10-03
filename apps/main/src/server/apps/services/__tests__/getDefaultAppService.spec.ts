import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, User, Workspace } from '@prisma/client'
import { getDefaultAppService } from '../getDefaultApp.service'

const subject = async (workspaceId: string, userId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getDefaultAppService(prisma, context)
}

describe('getDefaultAppService', () => {
  let workspace: Workspace
  let user: User
  let defaultApp: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    defaultApp = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      isDefault: true,
    })
  })

  it('returns the default app', async () => {
    const result = await subject(workspace.id, user.id)

    expect(result.id).toBe(defaultApp.id)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )
    await subject(workspace.id, user.id)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when there is no default app', () => {
    beforeEach(async () => {
      await prisma.app.deleteMany({
        where: {
          isDefault: true,
        },
      })
    })

    it('returns a newly creared default app', async () => {
      const result = await subject(workspace.id, user.id)

      expect(result).toMatchObject({
        userId: user.id,
        workspaceId: workspace.id,
        isDefault: true,
      })
    })
  })
})
