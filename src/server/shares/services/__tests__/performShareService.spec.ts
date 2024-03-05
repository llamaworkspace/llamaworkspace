import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { WorkspaceInviteFactory } from '@/server/testing/factories/WorkspaceInviteFactory'
import { inviteToWorkspace } from '@/server/workspaces/services/inviteToWorkspace'
import { faker } from '@faker-js/faker'
import type { Post, User, Workspace, WorkspaceInvite } from '@prisma/client'
import { performShare } from '../performShare.service'

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

const subject = async (
  userId: string,
  workspaceId: string,
  postId: string,
  email: string,
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await performShare(prisma, context, { postId, email })
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

  describe('when the invited user exists', () => {
    it('shares the post', async () => {
      await subject(invitingUser.id, workspace.id, post.id, invitedUser.email!)
      const share = await prisma.share.findFirstOrThrow({
        where: { postId: post.id },
        include: { shareUsersOrInvites: true },
      })

      expect(share.sharerId).toBe(invitingUser.id)
      expect(share.shareUsersOrInvites.length).toBe(1)
      expect(share.shareUsersOrInvites.at(0)?.userId).toBe(invitedUser.id)
      expect(share.shareUsersOrInvites.at(0)?.workspaceInviteId).toBeNull()
    })
  })

  describe('when the invited user does not exist', () => {
    let fakeEmail: string
    let workspaceInvite: WorkspaceInvite

    beforeEach(() => {
      fakeEmail = faker.internet.email()

      mockedInviteToWorkspace.mockImplementation(async () => {
        workspaceInvite = await WorkspaceInviteFactory.create(prisma, {
          email: fakeEmail,
          workspaceId: workspace.id,
        })

        return workspaceInvite
      })
    })

    it('invites the user', async () => {
      await subject(invitingUser.id, workspace.id, post.id, fakeEmail)
      expect(inviteToWorkspace).toHaveBeenCalled()
    })

    it.only('creates the share', async () => {
      await subject(invitingUser.id, workspace.id, post.id, fakeEmail)

      const share = await prisma.share.findFirstOrThrow({
        where: { postId: post.id },
        include: { shareUsersOrInvites: true },
      })

      expect(share.sharerId).toBe(invitingUser.id)
      expect(share.shareUsersOrInvites.length).toBe(1)
      expect(share.shareUsersOrInvites.at(0)?.workspaceInviteId).toBe(
        workspaceInvite.id,
      )
      expect(share.shareUsersOrInvites.at(0)?.userId).toBeNull()
    })
  })

  describe.skip('when the inviting user does not have enough permissions', () => {
    it.todo('pending')
  })
})
