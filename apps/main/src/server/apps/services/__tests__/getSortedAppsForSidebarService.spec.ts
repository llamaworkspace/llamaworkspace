import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { AppsOnUsersFactory } from '@/server/testing/factories/AppsOnUsersFactory'
import { workspaceWithUsersAndAppsFixture } from '@/server/testing/fixtures/workspaceWithUsersAndApps.fixture'
import type { App, User, Workspace } from '@prisma/client'
import { getSortedAppsForSidebarService } from '../getSortedAppsForSidebar.service'

const subject = async (userId: string, workspaceId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await getSortedAppsForSidebarService(prisma, context)
}

describe('getSortedAppsForSidebarService', () => {
  let workspace: Workspace
  let user: User
  let otherUser: User
  let appWithScopeUser: App
  let appWithScopeUserOfOtherUser: App
  let appWithScopeUserOfOtherUserWhereMainUserIsInvited: App
  let appWithScopeEverybody: App
  let appWithScopeEverybodyOfOtherUser: App
  let appWithScopePrivate: App
  let appWithScopePrivateOfOtherUser: App

  beforeEach(async () => {
    const fixture = await workspaceWithUsersAndAppsFixture(prisma)
    workspace = fixture.workspace
    user = fixture.user
    otherUser = fixture.otherUser
    appWithScopeUser = fixture.appWithScopeUser
    appWithScopeUserOfOtherUser = fixture.appWithScopeUserOfOtherUser
    appWithScopeUserOfOtherUserWhereMainUserIsInvited =
      fixture.appWithScopeUserOfOtherUserWhereMainUserIsInvited
    appWithScopeEverybody = fixture.appWithScopeEverybody
    appWithScopeEverybodyOfOtherUser = fixture.appWithScopeEverybodyOfOtherUser
    appWithScopePrivate = fixture.appWithScopePrivate
    appWithScopePrivateOfOtherUser = fixture.appWithScopePrivateOfOtherUser

    await AppsOnUsersFactory.create(prisma, {
      appId: appWithScopeEverybody.id,
      userId: user.id,
      position: 1,
    })

    await AppsOnUsersFactory.create(prisma, {
      appId: appWithScopeUser.id,
      userId: user.id,
      position: 2,
    })

    await AppsOnUsersFactory.create(prisma, {
      appId: appWithScopeUserOfOtherUser.id,
      userId: user.id,
      position: 2,
    })
    await AppsOnUsersFactory.create(prisma, {
      appId: appWithScopePrivateOfOtherUser.id,
      userId: user.id,
      position: 2,
    })
  })

  it('returns the apps relevant to the user, in sorted form', async () => {
    const result = await subject(user.id, workspace.id)
    const expectedAppIdsSorted = [appWithScopeEverybody.id, appWithScopeUser.id]

    expect(result).toHaveLength(expectedAppIdsSorted.length)

    const resultIds = result.map((app) => app.id)
    expect(resultIds).toEqual(expectedAppIdsSorted)
  })

  it('does not return the default app', async () => {
    await AppFactory.create(prisma, {
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
