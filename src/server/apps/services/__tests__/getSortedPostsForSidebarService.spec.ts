import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AppsOnUsersFactory } from '@/server/testing/factories/AppsOnUsersFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { workspaceWithUsersAndPostsFixture } from '@/server/testing/fixtures/workspaceWithUsersAndPosts.fixture'
import type { App, User, Workspace } from '@prisma/client'
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
  let postWithScopeUser: App
  let postWithScopeUserOfOtherUser: App
  let postWithScopeUserOfOtherUserWhereMainUserIsInvited: App
  let postWithScopeEverybody: App
  let postWithScopeEverybodyOfOtherUser: App
  let postWithScopePrivate: App
  let postWithScopePrivateOfOtherUser: App

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

    await AppsOnUsersFactory.create(prisma, {
      appId: postWithScopeEverybody.id,
      userId: user.id,
      position: 1,
    })

    await AppsOnUsersFactory.create(prisma, {
      appId: postWithScopeUser.id,
      userId: user.id,
      position: 2,
    })

    await AppsOnUsersFactory.create(prisma, {
      appId: postWithScopeUserOfOtherUser.id,
      userId: user.id,
      position: 2,
    })
    await AppsOnUsersFactory.create(prisma, {
      appId: postWithScopePrivateOfOtherUser.id,
      userId: user.id,
      position: 2,
    })
  })

  it('returns the apps relevant to the user, in sorted form', async () => {
    const result = await subject(user.id, workspace.id)
    const expectedPostIdsSorted = [
      postWithScopeEverybody.id,
      postWithScopeUser.id,
    ]

    expect(result).toHaveLength(expectedPostIdsSorted.length)

    const resultIds = result.map((app) => app.id)
    expect(resultIds).toEqual(expectedPostIdsSorted)
  })

  it('does not return the default app', async () => {
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
