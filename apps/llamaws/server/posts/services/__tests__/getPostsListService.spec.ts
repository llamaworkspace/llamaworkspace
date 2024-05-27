import type { AppConfigVersion, Post, User, Workspace } from '@prisma/client'
import { createUserOnWorkspaceContext } from 'server/auth/userOnWorkspaceContext'
import { prisma } from 'server/db'
import { AppConfigVersionFactory } from 'server/testing/factories/AppConfigVersionFactory'
import { PostFactory } from 'server/testing/factories/PostFactory'
import { workspaceWithUsersAndPostsFixture } from 'server/testing/fixtures/workspaceWithUsersAndPosts.fixture'
import { getPostsListService } from '../getPostsList.service'

type PostWithLatestConfig = Post & { latestConfig: AppConfigVersion }

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
    const fixture = await workspaceWithUsersAndPostsFixture(prisma)
    workspace = fixture.workspace
    user = fixture.user
    otherUser = fixture.otherUser
    postWithScopeUser = fixture.postWithScopeUser
    postWithScopeUserOfOtherUser = fixture.postWithScopeUserOfOtherUser
    postWithScopeUserOfOtherUserWhereMainUserIsInvited =
      fixture.postWithScopeUserOfOtherUserWhereMainUserIsInvited
    postWithScopeEverybody = fixture.postWithScopeEverybody
    postWithScopeEverybodyOfOtherUser =
      fixture.postWithScopeEverybodyOfOtherUser
    postWithScopePrivate = fixture.postWithScopePrivate
    postWithScopePrivateOfOtherUser = fixture.postWithScopePrivateOfOtherUser
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

  describe('when the latestAppConfig is requested', () => {
    let nextAppConfigForPost1: AppConfigVersion

    beforeEach(async () => {
      nextAppConfigForPost1 = await AppConfigVersionFactory.create(prisma, {
        appId: postWithScopeUser.id,
      })
    })
    it('returns the posts with the latest post config', async () => {
      const result = (await subject(
        user.id,
        workspace.id,
        true,
      )) as PostWithLatestConfig[]

      const post2ConfigVersion = await prisma.appConfigVersion.findFirstOrThrow(
        {
          where: {
            appId: postWithScopeEverybody.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      )

      const resultScopeUser = result.find(
        (post) => post.id === postWithScopeUser.id,
      )
      const resultScopeEverybody = result.find(
        (post) => post.id === postWithScopeEverybody.id,
      )
      expect(resultScopeUser!.latestConfig.id).toBe(nextAppConfigForPost1.id)
      expect(resultScopeEverybody!.latestConfig.id).toBe(post2ConfigVersion.id)
      7
    })
  })
})
