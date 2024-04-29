import { prisma } from '@/server/db'
import { workspaceOnboardingCreationService } from '@/server/onboarding/services/workspaceOnboardingCreation.service'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { setDefaultsForWorkspaceService } from '@/server/workspaces/services/setDefaultsForWorkspace.service'
import type { User } from '@prisma/client'
import { createWorkspaceForUserService } from '../createWorkspaceForUser.service'

jest.mock('@/server/workspaces/services/setDefaultsForWorkspace.service')
jest.mock('@/server/onboarding/services/workspaceOnboardingCreation.service')

const subject = async (userId: string) => {
  return await createWorkspaceForUserService(prisma, userId)
}

describe('settleWorkspaceInvitesForNewUserService', () => {
  let user: User

  beforeEach(async () => {
    jest.clearAllMocks()
    user = await UserFactory.create(prisma, {})
  })

  it('creates a new workspace linked to the user', async () => {
    const workspace = await subject(user.id)

    const workspaceInDb = await prisma.usersOnWorkspaces.findMany({
      where: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    })

    expect(workspaceInDb).toHaveLength(1)
  })

  it('executes setDefaultsForWorkspace service', async () => {
    await subject(user.id)
    expect(setDefaultsForWorkspaceService).toHaveBeenCalled()
  })

  it('executes workspaceOnboardingCreation service', async () => {
    await subject(user.id)
    expect(workspaceOnboardingCreationService).toHaveBeenCalled()
  })
})
