import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, User, Workspace } from '@prisma/client'
import { getPostByIdService } from '../getPostById.service'

const subject = async (workspaceId: string, userId: string, postId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getPostByIdService(prisma, context, { postId })
}

describe('getPostByIdService', () => {
  let workspace: Workspace
  let user: User
  let app: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  it('returns the post', async () => {
    const result = await subject(workspace.id, user.id, app.id)

    expect(result.id).toBe(app.id)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )
    await subject(workspace.id, user.id, app.id)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })
})
