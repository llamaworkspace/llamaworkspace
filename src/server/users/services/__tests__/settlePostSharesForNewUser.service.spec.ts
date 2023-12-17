import { prisma } from '@/server/db'
import { InviteFactory } from '@/server/testing/factories/InviteFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { PostShareFactory } from '@/server/testing/factories/PostShareFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { faker } from '@faker-js/faker'
import type { Invite, Post, PostShare, User } from '@prisma/client'
import { settlePostSharesForNewUserService } from '../settlePostSharesForNewUser.service'

describe.skip('settlePostSharesForNewUserService', () => {
  let invitingUser: User,
    invitedUser: User,
    otherInvitingUser: User,
    invite1: Invite,
    invite2: Invite,
    inviteFromOtherInvitingUser: Invite,
    post1: Post,
    post2: Post,
    postFromOtherInvitingUser: Post,
    postShare1: PostShare,
    postShare2: PostShare,
    postShareFromOtherInvitingUser: PostShare

  let unrelatedInvitingUser: User,
    unrelatedInvitedUser: User,
    postFromUnrelatedInvitingUser: Post,
    inviteFromUnrelatedInvitingUser: Invite,
    postShareFromUnrelatedInvitingUser: PostShare

  beforeEach(async () => {
    // Users
    const invitedUserEmail = faker.internet.email()
    const unrelatedInvitedUserEmail = faker.internet.email()
    const workspace = await WorkspaceFactory.create(prisma)

    invitingUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    invitedUser = await UserFactory.create(prisma, {
      email: invitedUserEmail,
      workspaceId: workspace.id,
    })
    otherInvitingUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    unrelatedInvitingUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    unrelatedInvitedUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    // Posts
    post1 = await PostFactory.create(prisma, {
      userId: invitingUser.id,
      workspaceId: workspace.id,
    })
    post2 = await PostFactory.create(prisma, {
      userId: invitingUser.id,
      workspaceId: workspace.id,
    })
    postFromOtherInvitingUser = await PostFactory.create(prisma, {
      userId: otherInvitingUser.id,
      workspaceId: workspace.id,
    })
    postFromUnrelatedInvitingUser = await PostFactory.create(prisma, {
      userId: unrelatedInvitingUser.id,
      workspaceId: workspace.id,
    })

    // Invites
    invite1 = await InviteFactory.create(prisma, {
      invitedById: invitingUser.id,
      email: invitedUserEmail,
    })
    invite2 = await InviteFactory.create(prisma, {
      invitedById: invitingUser.id,
      email: invitedUserEmail,
    })
    inviteFromOtherInvitingUser = await InviteFactory.create(prisma, {
      invitedById: unrelatedInvitingUser.id,
      email: invitedUserEmail,
    })
    inviteFromUnrelatedInvitingUser = await InviteFactory.create(prisma, {
      invitedById: otherInvitingUser.id,
      email: unrelatedInvitedUserEmail,
    })

    // PostShares
    postShare1 = await PostShareFactory.create(prisma, {
      postId: post1.id,
      inviteId: invite1.id,
    })
    postShare2 = await PostShareFactory.create(prisma, {
      postId: post2.id,
      inviteId: invite2.id,
    })
    postShareFromOtherInvitingUser = await PostShareFactory.create(prisma, {
      postId: postFromOtherInvitingUser.id,
      inviteId: inviteFromOtherInvitingUser.id,
    })
    postShareFromUnrelatedInvitingUser = await PostShareFactory.create(prisma, {
      postId: postFromUnrelatedInvitingUser.id,
      inviteId: inviteFromUnrelatedInvitingUser.id,
    })
  })

  const subject = async (userId: string) => {
    await settlePostSharesForNewUserService(prisma, userId)
  }

  it('links posts where the user is invited, to the user', async () => {
    await subject(invitedUser.id)

    const postShares = await prisma.postShare.findMany({
      where: {
        userId: invitedUser.id,
      },
    })

    expect(postShares).toHaveLength(3)
    expect(postShares).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          postId: post1.id,
          userId: invitedUser.id,
          inviteId: invite1.id,
        }),
        expect.objectContaining({
          postId: post2.id,
          userId: invitedUser.id,
          inviteId: invite2.id,
        }),
        expect.objectContaining({
          postId: postFromOtherInvitingUser.id,
          userId: invitedUser.id,
          inviteId: inviteFromOtherInvitingUser.id,
        }),
      ]),
    )
  })

  it('creates postSorts for the posts the user has been invited', async () => {
    await subject(invitedUser.id)

    const postShares = await prisma.postSort.findMany({
      where: {
        userId: invitedUser.id,
      },
    })

    expect(postShares).toHaveLength(3)
    expect(postShares).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          postId: post1.id,
          userId: invitedUser.id,
        }),
        expect.objectContaining({
          postId: post2.id,
          userId: invitedUser.id,
        }),
        expect.objectContaining({
          postId: postFromOtherInvitingUser.id,
          userId: invitedUser.id,
        }),
      ]),
    )
  })
})
