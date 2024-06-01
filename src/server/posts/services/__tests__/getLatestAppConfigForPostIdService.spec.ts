import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppConfigVersionFactory } from '@/server/testing/factories/AppConfigVersionFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, AppConfigVersion, User, Workspace } from '@prisma/client'
import { getLatestAppConfigForPostIdService } from '../getLatestAppConfigForPostId.service'

const subject = async (userId: string, workspaceId: string, postId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getLatestAppConfigForPostIdService(prisma, context, { postId })
}

describe('getLatestAppConfigForPostIdService', () => {
  let workspace: Workspace
  let user: User
  let post: App
  let anotherAppConfigVersion: AppConfigVersion

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    anotherAppConfigVersion = await AppConfigVersionFactory.create(prisma, {
      appId: post.id,
    })
  })

  it('returns the latest post config', async () => {
    const result = await subject(user.id, workspace.id, post.id)
    expect(result.id).toBe(anotherAppConfigVersion.id)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(user.id, workspace.id, post.id)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })
})
