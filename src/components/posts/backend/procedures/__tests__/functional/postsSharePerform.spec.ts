import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { WorkspaceInviteFactory } from '@/server/testing/factories/WorkspaceInviteFactory'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'
import { inviteToWorkspace } from '@/server/workspaces/services/inviteToWorkspace'
import { faker } from '@faker-js/faker'
import type { Post, User, Workspace, WorkspaceInvite } from '@prisma/client'

type MockedInviteToWorkspaceService = jest.MockedFunction<
  typeof inviteToWorkspace
>

const mockedInviteToWorkspace =
  inviteToWorkspace as MockedInviteToWorkspaceService

jest.mock('@/server/workspaces/services/inviteToWorkspace', () => {
  return {
    inviteToWorkspace: jest.fn(),
  }
})

const subject = async (userId: string, postId: string, email: string) => {
  const { caller } = trpcContextSetupHelper(prisma, userId)
  return await caller.posts.sharev2({ postId, email })
}

describe('postsSharePerform', () => {
  let workspace: Workspace
  let invitingUser: User
  let invitedUser: User
  let post: Post

  beforeEach(() => {
    mockedInviteToWorkspace.mockClear()
  })

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

  it('shares the post', async () => {
    await subject(invitingUser.id, post.id, invitedUser.email!)
    const share = await prisma.share.findFirstOrThrow({
      where: { postId: post.id },
      include: { shareUsers: true },
    })

    expect(share.sharerId).toBe(invitingUser.id)
    expect(share.shareUsers.length).toBe(1)
    expect(share.shareUsers.at(0)?.userId).toBe(invitedUser.id)
  })

  describe.skip('when the inviting user does not have enough permissions', () => {
    it.todo('pending')
  })

  describe('when the invited user does not exist', () => {
    let fakeEmail: string
    let invite: WorkspaceInvite
    beforeEach(() => {
      fakeEmail = faker.internet.email()

      mockedInviteToWorkspace.mockImplementation(async () => {
        invite = await WorkspaceInviteFactory.create(prisma, {
          email: fakeEmail,
          workspaceId: workspace.id,
        })
        return invite
      })
    })

    it('invites the user', async () => {
      await subject(invitingUser.id, post.id, fakeEmail)
      expect(inviteToWorkspace).toHaveBeenCalled()
    })

    it('creates the share', async () => {
      mockedInviteToWorkspace.mockImplementation(async () => {
        return await WorkspaceInviteFactory.create(prisma, {
          email: fakeEmail,
          workspaceId: workspace.id,
        })
      })
      await subject(invitingUser.id, post.id, fakeEmail)

      const share = await prisma.share.findFirstOrThrow({
        where: { postId: post.id },
        include: { shareUsers: true },
      })

      expect(share.sharerId).toBe(invitingUser.id)
      expect(share.workspaceInviteId).toBeDefined()
      expect(share.shareUsers.length).toBe(0)
    })
  })
})
