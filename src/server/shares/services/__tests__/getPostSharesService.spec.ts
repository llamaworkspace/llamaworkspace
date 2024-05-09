import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { ShareTargetFactory } from '@/server/testing/factories/ShareTargetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { ShareScope, UserAccessLevel } from '@/shared/globalTypes'
import type { Post, Share, User, Workspace } from '@prisma/client'
import { getPostSharesService } from '../getPostShares.service'

const subject = async (userId: string, workspaceId: string, postId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getPostSharesService(prisma, context, { postId })
}

describe('getPostSharesService', () => {
  let workspace: Workspace
  let userPostOwner: User
  let sharedUser: User
  let post: Post
  let shareXXXXXXX: Share

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    userPostOwner = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    sharedUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post = await PostFactory.create(prisma, {
      userId: userPostOwner.id,
      workspaceId: workspace.id,
    })
  })

  describe('when scope is "user"', () => {
    it('returns the share with scope User', async () => {
      const share = await prisma.share.findFirstOrThrow({
        where: {
          postId: post.id,
        },
      })

      const otherSharedUser = await UserFactory.create(prisma, {
        workspaceId: workspace.id,
      })

      await ShareTargetFactory.create(prisma, {
        shareId: share.id,
        sharerId: userPostOwner.id,
        userId: sharedUser.id,
      })
      await ShareTargetFactory.create(prisma, {
        shareId: share.id,
        sharerId: userPostOwner.id,
        userId: otherSharedUser.id,
      })

      const result = await subject(sharedUser.id, workspace.id, post.id)

      expect(result.shareTargets).toHaveLength(3)
      expect(result.shareTargets).toEqual([
        expect.objectContaining({
          shareId: share.id,
          sharerId: userPostOwner.id,
          userId: userPostOwner.id,
          workspaceInviteId: null,
          accessLevel: UserAccessLevel.Owner.toString(),
        }),
        expect.objectContaining({
          shareId: share.id,
          sharerId: userPostOwner.id,
          userId: sharedUser.id,
          workspaceInviteId: null,
          accessLevel: UserAccessLevel.Use.toString(),
        }),
        expect.objectContaining({
          shareId: share.id,
          sharerId: userPostOwner.id,
          userId: otherSharedUser.id,
          workspaceInviteId: null,
          accessLevel: UserAccessLevel.Use.toString(),
        }),
      ])
    })
  })

  describe.skip('when there are users not in the workspace', () => {})

  describe('when scope is "everybody"', () => {
    it('returns the share with scope Everybody', async () => {
      await prisma.share.update({
        where: {
          postId: post.id,
        },
        data: {
          scope: ShareScope.Everybody,
        },
      })

      const result = await subject(sharedUser.id, workspace.id, post.id)

      expect(result).toEqual(
        expect.objectContaining({
          scope: ShareScope.Everybody,
        }),
      )
    })
  })
})
