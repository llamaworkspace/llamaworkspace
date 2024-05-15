import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { sendEmail } from '@/server/mailer/mailer'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { WorkspaceInviteFactory } from '@/server/testing/factories/WorkspaceInviteFactory'
import { inviteToWorkspaceService } from '@/server/workspaces/services/inviteToWorkspace.service'
import { ShareScope, UserAccessLevel } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { faker } from '@faker-js/faker'
import type { Post, User, Workspace, WorkspaceInvite } from '@prisma/client'
import { sharePerformService } from '../sharePerform.service'

type MockedInviteToWorkspaceService = jest.MockedFunction<
  typeof inviteToWorkspaceService
>

type MockedSendEmail = jest.MockedFunction<typeof sendEmail>

const mockedInviteToWorkspace =
  inviteToWorkspaceService as MockedInviteToWorkspaceService

const mockedSendEmail = sendEmail as MockedSendEmail

jest.mock('@/server/workspaces/services/inviteToWorkspace.service', () => {
  return {
    inviteToWorkspaceService: jest.fn(),
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
  return await sharePerformService(prisma, context, { postId, email })
}

describe('postsSharePerformService', () => {
  let workspace: Workspace
  let invitingUser: User
  let post: Post

  beforeEach(() => {
    mockedInviteToWorkspace.mockClear()
  })

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    invitingUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post = await PostFactory.create(prisma, {
      userId: invitingUser.id,
      workspaceId: workspace.id,
    })
  })

  it('calls PermissionsVerifier', async () => {
    const invitedUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(invitingUser.id, workspace.id, post.id, invitedUser.email!)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Invite,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when the invited user exists', () => {
    let invitedUser: User

    beforeEach(async () => {
      invitedUser = await UserFactory.create(prisma, {
        workspaceId: workspace.id,
      })
    })

    it('shares the post', async () => {
      const result = await subject(
        invitingUser.id,
        workspace.id,
        post.id,
        invitedUser.email!,
      )

      expect(result).toMatchObject({
        postId: post.id,
        scope: ShareScope.Private,
        shareTargets: [
          expect.objectContaining({
            sharerId: invitingUser.id,
            userId: invitingUser.id,
            workspaceInviteId: null,
            accessLevel: UserAccessLevel.Owner,
          }),
          expect.objectContaining({
            sharerId: invitingUser.id,
            userId: invitedUser.id,
            workspaceInviteId: null,
            accessLevel: UserAccessLevel.Use,
          }),
        ],
      })
    })

    it('persists in the db only once', async () => {
      await subject(invitingUser.id, workspace.id, post.id, invitedUser.email!)

      const shares = await prisma.share.findMany({
        where: { postId: post.id },
        include: { shareTargets: true },
      })

      expect(shares).toHaveLength(1)
    })

    describe('and the user is self', () => {
      it('throws an already invited alert', async () => {
        await expect(
          subject(invitingUser.id, workspace.id, post.id, invitingUser.email!),
        ).rejects.toThrow('You cannot invite yourself')
      })
    })

    describe('and the user is already invited to the chatbot', () => {
      it('throws an already invited alert', async () => {
        await subject(
          invitingUser.id,
          workspace.id,
          post.id,
          invitedUser.email!,
        )

        await expect(
          subject(invitingUser.id, workspace.id, post.id, invitedUser.email!),
        ).rejects.toThrow('You have already invited this user')
      })
    })

    it('sends a custom invite', async () => {
      await subject(invitingUser.id, workspace.id, post.id, invitedUser.email!)
      expect(mockedSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Your invitation to Joia',
          to: invitedUser.email!,
        }),
      )
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
          invitedById: invitingUser.id,
        })

        return workspaceInvite
      })
    })

    it('invites the user, without sending the original invite email', async () => {
      await subject(invitingUser.id, workspace.id, post.id, fakeEmail)
      expect(inviteToWorkspaceService).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        true,
        expect.anything(),
      )
    })

    it('creates the share', async () => {
      await subject(invitingUser.id, workspace.id, post.id, fakeEmail)

      const shares = await prisma.share.findMany({
        where: { postId: post.id },
        include: { shareTargets: true },
      })

      expect(shares).toHaveLength(1)
      const share = shares[0]!

      expect(share).toMatchObject({
        postId: post.id,
        scope: ShareScope.Private,
      })
      expect(share.shareTargets).toEqual([
        expect.objectContaining({
          sharerId: invitingUser.id,
          userId: invitingUser.id,
          workspaceInviteId: null,
          accessLevel: UserAccessLevel.Owner,
        }),
        expect.objectContaining({
          sharerId: invitingUser.id,
          userId: null,
          workspaceInviteId: workspaceInvite.id,
          accessLevel: UserAccessLevel.Use,
        }),
      ])
    })

    it('sends a custom invite', async () => {
      await subject(invitingUser.id, workspace.id, post.id, fakeEmail)
      expect(mockedSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Your invitation to Joia',
          to: fakeEmail,
        }),
      )
    })

    describe('and the user is already invited to the chatbot', () => {
      it('throws an already invited alert', async () => {
        await subject(invitingUser.id, workspace.id, post.id, fakeEmail)

        await expect(
          subject(invitingUser.id, workspace.id, post.id, fakeEmail),
        ).rejects.toThrow('You have already invited this user')
      })
    })

    describe('and the user is already invited to the workspace', () => {
      it('omits inviting the user to the workspace', async () => {
        await WorkspaceInviteFactory.create(prisma, {
          email: fakeEmail,
          workspaceId: workspace.id,
          invitedById: invitingUser.id,
        })
        expect(inviteToWorkspaceService).not.toHaveBeenCalled()
      })
    })
  })

  describe('when multiple people are invited', () => {
    let fakeEmail: string
    let workspaceInvite: WorkspaceInvite
    let invitedUser: User

    beforeEach(async () => {
      invitedUser = await UserFactory.create(prisma, {
        workspaceId: workspace.id,
      })

      fakeEmail = faker.internet.email()

      mockedInviteToWorkspace.mockImplementation(async () => {
        workspaceInvite = await WorkspaceInviteFactory.create(prisma, {
          email: fakeEmail,
          workspaceId: workspace.id,
          invitedById: invitingUser.id,
        })

        return workspaceInvite
      })
    })

    it('invites both users', async () => {
      const invitedUser2 = await UserFactory.create(prisma, {
        workspaceId: workspace.id,
      })
      await subject(invitingUser.id, workspace.id, post.id, invitedUser.email!)
      await subject(invitingUser.id, workspace.id, post.id, invitedUser2.email!)

      const shares = await prisma.share.findMany({
        where: { postId: post.id },
        include: { shareTargets: true },
      })

      expect(shares).toHaveLength(1)
      expect(shares[0]!.shareTargets).toHaveLength(3)
      expect(shares[0]).toMatchObject({
        postId: post.id,
        shareTargets: [
          expect.objectContaining({
            sharerId: invitingUser.id,
            userId: invitingUser.id,
            workspaceInviteId: null,
            accessLevel: UserAccessLevel.Owner,
          }),
          expect.objectContaining({
            sharerId: invitingUser.id,
            userId: invitedUser.id,
            workspaceInviteId: null,
            accessLevel: UserAccessLevel.Use,
          }),
          expect.objectContaining({
            sharerId: invitingUser.id,
            userId: invitedUser2.id,
            workspaceInviteId: null,
            accessLevel: UserAccessLevel.Use,
          }),
        ],
      })
    })

    describe('and there are non existing users', () => {
      let workspaceInvite: WorkspaceInvite

      beforeEach(() => {
        mockedInviteToWorkspace.mockImplementation(async (_, __, email) => {
          workspaceInvite = await WorkspaceInviteFactory.create(prisma, {
            email: email,
            workspaceId: workspace.id,
            invitedById: invitingUser.id,
          })

          return workspaceInvite
        })
      })

      it('where both are non existing, it invites them all', async () => {
        const firstShare = await subject(
          invitingUser.id,
          workspace.id,
          post.id,
          faker.internet.email(),
        )

        const secondShare = await subject(
          invitingUser.id,
          workspace.id,
          post.id,
          faker.internet.email(),
        )

        const shares = await prisma.share.findMany({
          where: { postId: post.id },
          include: { shareTargets: true },
        })

        const workspaceInvites = await prisma.workspaceInvite.findMany({
          where: { workspaceId: workspace.id },
        })
        const workspaceInviteIds = workspaceInvites.map((invite) => invite.id)

        const dbWorkspaceInviteIds = shares.flatMap((share) => {
          return share.shareTargets.map(
            (shareTarget) => shareTarget.workspaceInviteId,
          )
        })

        expect(shares).toHaveLength(1)
        const share = shares[0]!
        expect(share.shareTargets).toHaveLength(3)
        expect(workspaceInviteIds).toEqual(dbWorkspaceInviteIds.filter(Boolean))
      })

      it('where there is a mix of non existing and existing', async () => {
        await subject(invitingUser.id, workspace.id, post.id, fakeEmail)
        await subject(
          invitingUser.id,
          workspace.id,
          post.id,
          faker.internet.email(),
        )

        const shares = await prisma.share.findMany({
          where: { postId: post.id },
          include: { shareTargets: true },
        })

        expect(shares).toHaveLength(1)
        const share = shares[0]!
        expect(share.shareTargets).toHaveLength(3)
      })
    })
  })
})
