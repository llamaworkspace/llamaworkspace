import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AppConfigVersionFactory } from '@/server/testing/factories/AppConfigVersionFactory'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { workspaceWithUsersAndAppsFixture } from '@/server/testing/fixtures/workspaceWithUsersAndApps.fixture'
import type { App, AppConfigVersion, User, Workspace } from '@prisma/client'
import { getAppsListService } from '../getAppsList.service'

type AppWithLatestConfig = App & { latestConfig: AppConfigVersion }

const subject = async (
  userId: string,
  workspaceId: string,
  includeLatestConfig?: boolean,
): Promise<App[] | AppWithLatestConfig[]> => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  if (includeLatestConfig) {
    return await getAppsListService(prisma, context, {
      includeLatestConfig: true,
    })
  }

  return await getAppsListService(prisma, context)
}

describe('getAppsListService', () => {
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
  })

  it('returns the apps relevant to the user, in sorted form', async () => {
    const result = await subject(user.id, workspace.id)

    const expectedAppIdsSorted = [
      appWithScopePrivate.id,
      appWithScopeEverybodyOfOtherUser.id,
      appWithScopeEverybody.id,
      appWithScopeUserOfOtherUserWhereMainUserIsInvited.id,
      appWithScopeUser.id,
    ]

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

  describe('when the latestAppConfig is requested', () => {
    let nextAppConfigForApp1: AppConfigVersion

    beforeEach(async () => {
      nextAppConfigForApp1 = await AppConfigVersionFactory.create(prisma, {
        appId: appWithScopeUser.id,
      })
    })
    it('returns the apps with the latest app config', async () => {
      const result = (await subject(
        user.id,
        workspace.id,
        true,
      )) as AppWithLatestConfig[]

      const app2ConfigVersion = await prisma.appConfigVersion.findFirstOrThrow({
        where: {
          appId: appWithScopeEverybody.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      const resultScopeUser = result.find(
        (app) => app.id === appWithScopeUser.id,
      )
      const resultScopeEverybody = result.find(
        (app) => app.id === appWithScopeEverybody.id,
      )
      expect(resultScopeUser!.latestConfig.id).toBe(nextAppConfigForApp1.id)
      expect(resultScopeEverybody!.latestConfig.id).toBe(app2ConfigVersion.id)
      7
    })
  })
})
