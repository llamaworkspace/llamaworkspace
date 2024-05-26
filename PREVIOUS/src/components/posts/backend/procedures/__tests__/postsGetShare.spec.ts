import { prisma } from '@/server/db'
import type * as getPostSharesServiceWrapper from '@/server/shares/services/getPostShares.service'
import { getPostSharesService } from '@/server/shares/services/getPostShares.service'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'
import { ShareScope, UserAccessLevel } from '@/shared/globalTypes'
import type { Post, User, Workspace } from '@prisma/client'

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
  return await caller.posts.getShare({ postId })
}

describe('postsGetShares', () => {
  let workspace: Workspace
  let invitingUser: User
  let post: Post

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    invitingUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    // We create an invited user
    await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    post = await PostFactory.create(prisma, {
      userId: invitingUser.id,
      workspaceId: workspace.id,
    })
  })

  it('invokes getPostSharesService', async () => {
    await subject(invitingUser.id, post.id)
    expect(getPostSharesService).toHaveBeenCalled()
  })

  it('returns a schema specific response', async () => {
    const response = await subject(invitingUser.id, post.id)

    expect(response).toEqual(
      expect.objectContaining({
        postId: post.id,
        scope: ShareScope.Private,
      }),
    )

    expect(response.shareTargets).toHaveLength(1)
    expect(response.shareTargets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: invitingUser.email,
          accessLevel: UserAccessLevel.Owner,
          userId: invitingUser.id,
          workspaceInviteId: null,
        }),
      ]),
    )
  })
})
