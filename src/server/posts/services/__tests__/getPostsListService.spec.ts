import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PostConfigVersionFactory } from '@/server/testing/factories/PostConfigVersionFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { ShareTargetFactory } from '@/server/testing/factories/ShareTargetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { ShareScope } from '@/shared/globalTypes'
import type { Post, PostConfigVersion, User, Workspace } from '@prisma/client'
import { getPostsListService } from '../getPostsList.service'

type PostWithLatestConfig = Post & { latestConfig: PostConfigVersion }

const subject = async (
  userId: string,
  workspaceId: string,
  includeLatestConfig?: boolean,
): Promise<Post[] | PostWithLatestConfig[]> => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  if (includeLatestConfig) {
    return await getPostsListService(prisma, context, {
      includeLatestConfig: true,
    })
  }

  return await getPostsListService(prisma, context)
}

describe('getPostsListService', () => {
  let workspace: Workspace
  let user: User
  let otherUser: User
  let postWithScopeUser: Post
  let postWithScopeUserOfOtherUser: Post
  let postWithScopeUserOfOtherUserWhereMainUserIsInvited: Post
  let postWithScopeEverybody: Post
  let postWithScopeEverybodyOfOtherUser: Post
  let postWithScopePrivate: Post
  let postWithScopePrivateOfOtherUser: Post

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    otherUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    postWithScopeUser = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      title: 'postWithScopeUser',
    })

    postWithScopeUserOfOtherUser = await PostFactory.create(prisma, {
      userId: otherUser.id,
      workspaceId: workspace.id,
      title: 'postWithScopeUserOfOtherUser',
    })

    postWithScopeUserOfOtherUserWhereMainUserIsInvited =
      await PostFactory.create(prisma, {
        userId: otherUser.id,
        workspaceId: workspace.id,
        title: 'postWithScopeUserOfOtherUserWhereMainUserIsInvited',
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

    postWithScopeEverybody = await PostFactory.create(prisma, {
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

    postWithScopeEverybodyOfOtherUser = await PostFactory.create(prisma, {
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

    postWithScopePrivate = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      title: 'postWithScopePrivate',
    })

    await prisma.share.update({
      where: {
        postId: postWithScopePrivate.id,
      },
      data: {
        scope: ShareScope.Private,
      },
    })

    postWithScopePrivateOfOtherUser = await PostFactory.create(prisma, {
      userId: otherUser.id,
      workspaceId: workspace.id,
      title: 'postWithScopePrivateOfOtherUser',
    })

    await prisma.share.update({
      where: {
        postId: postWithScopePrivateOfOtherUser.id,
      },
      data: {
        scope: ShareScope.Private,
      },
    })
  })

  it('returns the posts relevant to the user, in sorted form', async () => {
    const result = await subject(user.id, workspace.id)

    const expectedPostIdsSorted = [
      postWithScopePrivate.id,
      postWithScopeEverybodyOfOtherUser.id,
      postWithScopeEverybody.id,
      postWithScopeUserOfOtherUserWhereMainUserIsInvited.id,
      postWithScopeUser.id,
    ]

    expect(result).toHaveLength(expectedPostIdsSorted.length)

    const resultIds = result.map((post) => post.id)
    expect(resultIds).toEqual(expectedPostIdsSorted)
  })

  it('does not return the default post', async () => {
    await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      isDefault: true,
    })
    const result = await subject(user.id, workspace.id)
    expect(result).not.toContainEqual(
      expect.objectContaining({
        isDefault: true,
      }),
    )
  })

  describe('when the latestPostConfig is requested', () => {
    let nextPostConfigForPost1: PostConfigVersion

    beforeEach(async () => {
      nextPostConfigForPost1 = await PostConfigVersionFactory.create(prisma, {
        postId: postWithScopeUser.id,
      })
    })
    it('returns the posts with the latest post config', async () => {
      const result = (await subject(
        user.id,
        workspace.id,
        true,
      )) as PostWithLatestConfig[]

      const post2ConfigVersion =
        await prisma.postConfigVersion.findFirstOrThrow({
          where: {
            postId: postWithScopeEverybody.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

      const resultScopeUser = result.find(
        (post) => post.id === postWithScopeUser.id,
      )
      const resultScopeEverybody = result.find(
        (post) => post.id === postWithScopeEverybody.id,
      )
      expect(resultScopeUser!.latestConfig.id).toBe(nextPostConfigForPost1.id)
      expect(resultScopeEverybody!.latestConfig.id).toBe(post2ConfigVersion.id)
      7
    })
  })
})
