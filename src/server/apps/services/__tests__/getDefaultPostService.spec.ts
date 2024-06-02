import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, User, Workspace } from '@prisma/client'
import { getDefaultPostService } from '../getDefaultPost.service'

const subject = async (workspaceId: string, userId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getDefaultPostService(prisma, context)
}

describe('getDefaultPostService', () => {
  let workspace: Workspace
  let user: User
  let defaultPost: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    defaultPost = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      isDefault: true,
    })
  })

  it('returns the default app', async () => {
    const result = await subject(workspace.id, user.id)

    expect(result.id).toBe(defaultPost.id)
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
