import { prisma } from '@/server/db'
import { demoAppCreationService } from '@/server/onboarding/services/demoAppCreation.service'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { setDefaultsForWorkspaceService } from '@/server/workspaces/services/setDefaultsForWorkspace.service'
import { UserRole } from '@/shared/globalTypes'
import type { User } from '@prisma/client'
import { createWorkspaceForUserService } from '../createWorkspaceForUser.service'

jest.mock('@/server/workspaces/services/setDefaultsForWorkspace.service')
jest.mock('@/server/onboarding/services/demoAppCreation.service')

const subject = async (userId: string) => {
  return await createWorkspaceForUserService(prisma, userId)
}

describe('createWorkspaceForUserService', () => {
  let user: User

  beforeEach(async () => {
    jest.clearAllMocks()
    user = await UserFactory.create(prisma, {})
  })

  it('creates a new workspace linked to the user', async () => {
    const workspace = await subject(user.id)

    const workspacesInDb = await prisma.usersOnWorkspaces.findMany({
      where: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    })

    expect(workspacesInDb).toHaveLength(1)
  })

  it('sets the user role as Admin', async () => {
    const workspace = await subject(user.id)

    const workspaceInDb = await prisma.usersOnWorkspaces.findFirstOrThrow({
      where: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    })

    expect(workspaceInDb).toMatchObject({
      role: UserRole.Admin,
    })
  })

  it('executes setDefaultsForWorkspace service', async () => {
    await subject(user.id)
    expect(setDefaultsForWorkspaceService).toHaveBeenCalled()
  })

  it('executes workspaceOnboardingCreation service', async () => {
    await subject(user.id)
    expect(demoAppCreationService).toHaveBeenCalled()
  })
})
