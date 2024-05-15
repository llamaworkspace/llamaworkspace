import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { PostsOnUsersFactory } from '@/server/testing/factories/PostsOnUsersFactory'
import { workspaceWithUsersAndPostsFixture } from '@/server/testing/fixtures/workspaceWithUsersAndPosts.fixture'
import type { Post, User, Workspace } from '@prisma/client'
import { getSortedPostsForSidebarService } from '../getSortedPostsForSidebar.service'

const subject = async (userId: string, workspaceId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await getSortedPostsForSidebarService(prisma, context)
}

describe('getSortedPostsForSidebarService', () => {
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

    await PostsOnUsersFactory.create(prisma, {
      postId: postWithScopeEverybody.id,
      userId: user.id,
      position: 1,
    })

    await PostsOnUsersFactory.create(prisma, {
      postId: postWithScopeUser.id,
      userId: user.id,
      position: 2,
    })

    await PostsOnUsersFactory.create(prisma, {
      postId: postWithScopeUserOfOtherUser.id,
      userId: user.id,
      position: 2,
    })
    await PostsOnUsersFactory.create(prisma, {
      postId: postWithScopePrivateOfOtherUser.id,
      userId: user.id,
      position: 2,
    })
  })

  it('returns the posts relevant to the user, in sorted form', async () => {
    const result = await subject(user.id, workspace.id)
    const expectedPostIdsSorted = [
      postWithScopeEverybody.id,
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
})
