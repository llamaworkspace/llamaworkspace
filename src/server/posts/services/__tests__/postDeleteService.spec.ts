import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Post, User, Workspace } from '@prisma/client'
import { postDeleteService } from '../postDelete.service'

const subject = async (workspaceId: string, userId: string, postId: string) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await postDeleteService(prisma, uowContext, { postId })
}

describe('postDeleteService', () => {
  let workspace: Workspace
  let user: User
  let post: Post

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  it('deletes the post', async () => {
    const postInDbBefore = await prisma.post.findFirst({
      where: {
        id: post.id,
      },
    })
    expect(postInDbBefore).not.toBeNull()

    await subject(workspace.id, user.id, post.id)

    const postInDb = await prisma.post.findFirst({
      where: {
        id: post.id,
      },
    })

    expect(postInDb).toBeNull()
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, post.id)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Delete,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when the postId is the defaultPost for the workspace', () => {
    let defaultPost: Post

    beforeEach(async () => {
      defaultPost = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        isDefault: true,
      })
    })

    it('throws an error', async () => {
      await expect(
        subject(workspace.id, user.id, defaultPost.id),
      ).rejects.toThrow()
    })
  })
})
