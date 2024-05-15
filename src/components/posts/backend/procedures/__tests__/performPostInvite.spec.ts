import { prisma } from '@/server/db'
import { performPostInviteService } from '@/server/shares/services/performPostInvite.service'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'
import type { Post, User, Workspace } from '@prisma/client'

jest.mock('@/server/shares/services/performPostInvite.service')

const subject = async (userId: string, postId: string, email: string) => {
  const { caller } = trpcContextSetupHelper(prisma, userId)
  return await caller.posts.invite({ postId, email })
}

describe('performPostInvite', () => {
  let workspace: Workspace
  let invitingUser: User
  let invitedUser: User
  let post: Post

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
  })

  it('invokes performShare', async () => {
    await subject(invitingUser.id, post.id, invitedUser.email!)
    expect(performPostInviteService).toHaveBeenCalled()
  })
})
