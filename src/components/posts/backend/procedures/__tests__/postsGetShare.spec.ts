import { prisma } from '@/server/db'
import type * as getPostSharesServiceWrapper from '@/server/shares/services/getPostShares.service'
import { getPostSharesService } from '@/server/shares/services/getPostShares.service'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'
import { ShareScope, UserAccessLevel } from '@/shared/globalTypes'
import type { App, User, Workspace } from '@prisma/client'

jest.mock('@/server/shares/services/getPostShares.service.ts', () => {
  const original = jest.requireActual(
    '@/server/shares/services/getPostShares.service',
  ) as unknown as typeof getPostSharesServiceWrapper
  return {
    getPostSharesService: jest.fn(original.getPostSharesService),
  }
})

const subject = async (userId: string, appId: string) => {
  const { caller } = trpcContextSetupHelper(prisma, userId)
  return await caller.apps.getShare({ appId })
}

describe('postsGetShares', () => {
  let workspace: Workspace
  let invitingUser: User
  let app: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    invitingUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    // We create an invited user
    await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    app = await PostFactory.create(prisma, {
      userId: invitingUser.id,
      workspaceId: workspace.id,
    })
  })

  it('invokes getPostSharesService', async () => {
    await subject(invitingUser.id, app.id)
    expect(getPostSharesService).toHaveBeenCalled()
  })

  it('returns a schema specific response', async () => {
    const response = await subject(invitingUser.id, app.id)

    expect(response).toEqual(
      expect.objectContaining({
        appId: app.id,
        scope: ShareScope.Private,
      }),
    )

    expect(response.shareTargets).toHaveLength(1)
    expect(response.shareTargets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: invitingUser.email,
          accessLevel: UserAccessLevel.Owner,
          userId: invitingUser.id,
          workspaceInviteId: null,
        }),
      ]),
    )
  })
})
