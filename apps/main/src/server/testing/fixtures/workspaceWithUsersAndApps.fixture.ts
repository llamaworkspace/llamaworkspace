import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ShareTargetFactory } from '@/server/testing/factories/ShareTargetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { ShareScope } from '@/shared/globalTypes'
import type { PrismaClient } from '@prisma/client'

export const workspaceWithUsersAndAppsFixture = async (
  prisma: PrismaClient,
) => {
  const workspace = await WorkspaceFactory.create(prisma)

  const user = await UserFactory.create(prisma, {
    workspaceId: workspace.id,
  })

  const otherUser = await UserFactory.create(prisma, {
    workspaceId: workspace.id,
  })

  const appWithScopeUser = await AppFactory.create(prisma, {
    userId: user.id,
    workspaceId: workspace.id,
    title: 'appWithScopeUser',
  })

  await prisma.share.update({
    where: {
      appId: appWithScopeUser.id,
    },
    data: {
      scope: ShareScope.User,
    },
  })

  const appWithScopeUserOfOtherUser = await AppFactory.create(prisma, {
    userId: otherUser.id,
    workspaceId: workspace.id,
    title: 'appWithScopeUserOfOtherUser',
  })

  await prisma.share.update({
    where: {
      appId: appWithScopeUserOfOtherUser.id,
    },
    data: {
      scope: ShareScope.User,
    },
  })

  const appWithScopeUserOfOtherUserWhereMainUserIsInvited =
    await AppFactory.create(prisma, {
      userId: otherUser.id,
      workspaceId: workspace.id,
      title: 'appWithScopeUserOfOtherUserWhereMainUserIsInvited',
    })
  await prisma.share.update({
    where: {
      appId: appWithScopeUserOfOtherUserWhereMainUserIsInvited.id,
    },
    data: {
      scope: ShareScope.User,
    },
  })

  const shareOfAppWithScopeUserOfOtherUserWhereMainUserIsInvited =
    await prisma.share.findFirstOrThrow({
      where: {
        appId: appWithScopeUserOfOtherUserWhereMainUserIsInvited.id,
      },
    })

  await ShareTargetFactory.create(prisma, {
    sharerId: otherUser.id,
    shareId: shareOfAppWithScopeUserOfOtherUserWhereMainUserIsInvited.id,
    userId: user.id,
  })

  const appWithScopeEverybody = await AppFactory.create(prisma, {
    userId: user.id,
    workspaceId: workspace.id,
    title: 'appWithScopeEverybody',
  })

  await prisma.share.update({
    where: {
      appId: appWithScopeEverybody.id,
    },
    data: {
      scope: ShareScope.Everybody,
    },
  })

  const appWithScopeEverybodyOfOtherUser = await AppFactory.create(prisma, {
    userId: otherUser.id,
    workspaceId: workspace.id,
    title: 'appWithScopeEverybodyOfOtherUser',
  })

  await prisma.share.update({
    where: {
      appId: appWithScopeEverybodyOfOtherUser.id,
    },
    data: {
      scope: ShareScope.Everybody,
    },
  })

  const appWithScopePrivate = await AppFactory.create(prisma, {
    userId: user.id,
    workspaceId: workspace.id,
    title: 'appWithScopePrivate',
  })

  const appWithScopePrivateOfOtherUser = await AppFactory.create(prisma, {
    userId: otherUser.id,
    workspaceId: workspace.id,
    title: 'appWithScopePrivateOfOtherUser',
  })

  return {
    workspace,
    user,
    otherUser,
    appWithScopeUser,
    appWithScopeUserOfOtherUser,
    appWithScopeUserOfOtherUserWhereMainUserIsInvited,
    shareOfAppWithScopeUserOfOtherUserWhereMainUserIsInvited,
    appWithScopeEverybody,
    appWithScopeEverybodyOfOtherUser,
    appWithScopePrivate,
    appWithScopePrivateOfOtherUser,
  }
}
