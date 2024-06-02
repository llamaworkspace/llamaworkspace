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
  let postWithScopeUser: App
  let postWithScopeUserOfOtherUser: App
  let postWithScopeUserOfOtherUserWhereMainUserIsInvited: App
  let postWithScopeEverybody: App
  let postWithScopeEverybodyOfOtherUser: App
  let postWithScopePrivate: App
  let postWithScopePrivateOfOtherUser: App

  beforeEach(async () => {
    const fixture = await workspaceWithUsersAndAppsFixture(prisma)
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

  it('returns the apps relevant to the user, in sorted form', async () => {
    const result = await subject(user.id, workspace.id)

    const expectedAppIdsSorted = [
      postWithScopePrivate.id,
      postWithScopeEverybodyOfOtherUser.id,
      postWithScopeEverybody.id,
      postWithScopeUserOfOtherUserWhereMainUserIsInvited.id,
      postWithScopeUser.id,
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
        appId: postWithScopeUser.id,
      })
    })
    it('returns the apps with the latest app config', async () => {
      const result = (await subject(
        user.id,
        workspace.id,
        true,
      )) as AppWithLatestConfig[]

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
        (app) => app.id === postWithScopeUser.id,
      )
      const resultScopeEverybody = result.find(
        (app) => app.id === postWithScopeEverybody.id,
      )
      expect(resultScopeUser!.latestConfig.id).toBe(nextAppConfigForApp1.id)
      expect(resultScopeEverybody!.latestConfig.id).toBe(post2ConfigVersion.id)
      7
    })
  })
})
