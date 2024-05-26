import type { PrismaClient } from '@prisma/client'
import { PostFactory } from 'server/testing/factories/PostFactory'
import { ShareTargetFactory } from 'server/testing/factories/ShareTargetFactory'
import { UserFactory } from 'server/testing/factories/UserFactory'
import { WorkspaceFactory } from 'server/testing/factories/WorkspaceFactory'
import { ShareScope } from 'shared/globalTypes'

export const workspaceWithUsersAndPostsFixture = async (
  prisma: PrismaClient,
) => {
  const workspace = await WorkspaceFactory.create(prisma)

  const user = await UserFactory.create(prisma, {
    workspaceId: workspace.id,
  })

  const otherUser = await UserFactory.create(prisma, {
    workspaceId: workspace.id,
  })

  const postWithScopeUser = await PostFactory.create(prisma, {
    userId: user.id,
    workspaceId: workspace.id,
    title: 'postWithScopeUser',
  })

  await prisma.share.update({
    where: {
      postId: postWithScopeUser.id,
    },
    data: {
      scope: ShareScope.User,
    },
  })

  const postWithScopeUserOfOtherUser = await PostFactory.create(prisma, {
    userId: otherUser.id,
    workspaceId: workspace.id,
    title: 'postWithScopeUserOfOtherUser',
  })

  await prisma.share.update({
    where: {
      postId: postWithScopeUserOfOtherUser.id,
    },
    data: {
      scope: ShareScope.User,
    },
  })

  const postWithScopeUserOfOtherUserWhereMainUserIsInvited =
    await PostFactory.create(prisma, {
      userId: otherUser.id,
      workspaceId: workspace.id,
      title: 'postWithScopeUserOfOtherUserWhereMainUserIsInvited',
    })
  await prisma.share.update({
    where: {
      postId: postWithScopeUserOfOtherUserWhereMainUserIsInvited.id,
    },
    data: {
      scope: ShareScope.User,
    },
  })

  const shareOfPostWithScopeUserOfOtherUserWhereMainUserIsInvited =
    await prisma.share.findFirstOrThrow({
      where: {
        postId: postWithScopeUserOfOtherUserWhereMainUserIsInvited.id,
      },
    })

  await ShareTargetFactory.create(prisma, {
    sharerId: otherUser.id,
    shareId: shareOfPostWithScopeUserOfOtherUserWhereMainUserIsInvited.id,
    userId: user.id,
  })

  const postWithScopeEverybody = await PostFactory.create(prisma, {
    userId: user.id,
    workspaceId: workspace.id,
    title: 'postWithScopeEverybody',
  })

  await prisma.share.update({
    where: {
      postId: postWithScopeEverybody.id,
    },
    data: {
      scope: ShareScope.Everybody,
    },
  })

  const postWithScopeEverybodyOfOtherUser = await PostFactory.create(prisma, {
    userId: otherUser.id,
    workspaceId: workspace.id,
    title: 'postWithScopeEverybodyOfOtherUser',
  })

  await prisma.share.update({
    where: {
      postId: postWithScopeEverybodyOfOtherUser.id,
    },
    data: {
      scope: ShareScope.Everybody,
    },
  })

  const postWithScopePrivate = await PostFactory.create(prisma, {
    userId: user.id,
    workspaceId: workspace.id,
    title: 'postWithScopePrivate',
  })

  const postWithScopePrivateOfOtherUser = await PostFactory.create(prisma, {
    userId: otherUser.id,
    workspaceId: workspace.id,
    title: 'postWithScopePrivateOfOtherUser',
  })

  return {
    workspace,
    user,
    otherUser,
    postWithScopeUser,
    postWithScopeUserOfOtherUser,
    postWithScopeUserOfOtherUserWhereMainUserIsInvited,
    shareOfPostWithScopeUserOfOtherUserWhereMainUserIsInvited,
    postWithScopeEverybody,
    postWithScopeEverybodyOfOtherUser,
    postWithScopePrivate,
    postWithScopePrivateOfOtherUser,
  }
}
