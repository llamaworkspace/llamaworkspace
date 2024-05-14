import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { PostConfigVersionFactory } from '@/server/testing/factories/PostConfigVersionFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Post, PostConfigVersion, User, Workspace } from '@prisma/client'
import { getLatestPostConfigForPostIdService } from '../getLatestPostConfigForPostId.service'

const subject = async (userId: string, workspaceId: string, postId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getLatestPostConfigForPostIdService(prisma, context, { postId })
}

describe('getLatestPostConfigForPostIdService', () => {
  let workspace: Workspace
  let user: User
  let post: Post
  let anotherPostConfigVersion: PostConfigVersion

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    anotherPostConfigVersion = await PostConfigVersionFactory.create(prisma, {
      postId: post.id,
    })
  })

  it('returns the latest post config', async () => {
    const result = await subject(user.id, workspace.id, post.id)
    expect(result.id).toBe(anotherPostConfigVersion.id)
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
