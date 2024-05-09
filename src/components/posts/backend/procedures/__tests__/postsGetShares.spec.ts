import { prisma } from '@/server/db'
import * as getPostSharesServiceWrapper from '@/server/shares/services/getPostShares.service'
import { getPostSharesService } from '@/server/shares/services/getPostShares.service'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { ShareFactory } from '@/server/testing/factories/ShareFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'
import { ShareScope, UserAccessLevel } from '@/shared/globalTypes'
import type { Post, Share, User, Workspace } from '@prisma/client'

jest.mock('@/server/shares/services/getPostShares.service.ts', () => {
  const original = jest.requireActual(
    '@/server/shares/services/getPostShares.service',
  ) as unknown as typeof getPostSharesServiceWrapper
  return {
    getPostSharesService: jest.fn(original.getPostSharesService),
  }
})

const subject = async (userId: string, postId: string) => {
  const { caller } = trpcContextSetupHelper(prisma, userId)
  return await caller.posts.getShares({ postId })
}

describe('postsGetShares', () => {
  let workspace: Workspace
  let invitingUser: User
  let invitedUser: User
  let post: Post
  let share: Share

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    invitingUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    invitedUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    post = await PostFactory.create(prisma, {
      userId: invitingUser.id,
      workspaceId: workspace.id,
    })
    share = await ShareFactory.create(prisma, {
      postId: post.id,
      userId: invitedUser.id,
      sharerId: invitingUser.id,
    })
  })

  it('invokes getPostSharesService', async () => {
    await subject(invitingUser.id, post.id)
    expect(getPostSharesService).toHaveBeenCalled()
  })

  it('returns a schema specific response', async () => {
    const response = await subject(invitingUser.id, post.id)

    expect(response).toEqual([
      expect.objectContaining({
        postId: post.id,
        scope: ShareScope.User,
        email: invitingUser.email,
        accessLevel: UserAccessLevel.Owner,
        userId: invitingUser.id,
        workspaceInviteId: null,
      }),
      {
        id: share.id,
        postId: post.id,
        scope: ShareScope.User,
        email: invitedUser.email,
        accessLevel: UserAccessLevel.Use,
        userId: invitedUser.id,
        workspaceInviteId: null,
      },
    ])
  })
})
