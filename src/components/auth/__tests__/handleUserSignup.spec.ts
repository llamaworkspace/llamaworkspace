import { prisma } from '@/server/db'
import { workspaceOnboardingCreationService } from '@/server/onboarding/services/workspaceOnboardingCreation.service'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { createDefaultsForNewUserService } from '@/server/users/services/createDefaultsForNewUser.service'
import * as createWorkspaceForUserServiceWrapper from '@/server/users/services/createWorkspaceForUser.service'
import { settleWorkspaceInvitesForNewUserService } from '@/server/users/services/settleWorkspaceInvitesForNewUser.service'
import { setDefaultsForWorkspaceService } from '@/server/workspaces/services/setDefaultsForWorkspace.service'
import { handleUserSignup } from '../handleUserSignup'

jest.mock('@/server/users/services/createWorkspaceForUser.service')

jest.mock('@/server/users/services/createWorkspaceForUser.service', () => {
  const original = jest.requireActual(
    '@/server/users/services/createWorkspaceForUser.service',
  ) as unknown as typeof createWorkspaceForUserServiceWrapper

  return {
    createWorkspaceForUserService: jest.fn(
      original.createWorkspaceForUserService,
    ),
  }
})

jest.mock('@/server/workspaces/services/addUserToWorkspace.service')
jest.mock('@/server/users/services/settlePostSharesForNewUser.service')
jest.mock('@/server/users/services/settleWorkspaceInvitesForNewUser.service')
jest.mock('@/server/onboarding/services/onboardingCreate.service')
jest.mock('@/server/users/services/createDefaultsForNewUser.service')
jest.mock('@/server/workspaces/services/setDefaultsForWorkspace.service')

describe('handleUserSignup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const subject = async () => {
    // const mock = createWorkspaceForUserService as MockedCreateWorkspaceForUser
    // const workspace = await WorkspaceFactory.create(prisma)
    // mock.mockResolvedValue(workspace as Workspace)
    const user = await UserFactory.create(prisma, {})

    await handleUserSignup(prisma, user.id)
    return user
  }

  it('executes createWorkspaceForUserService service', async () => {
    await subject()
    expect(
      createWorkspaceForUserServiceWrapper.createWorkspaceForUserService,
    ).toHaveBeenCalled()
  })

  it('executes settleWorkspaceInvitesForNewUser service', async () => {
    await subject()
    expect(settleWorkspaceInvitesForNewUserService).toHaveBeenCalled()
  })

  it('executes onboardingCreate service', async () => {
    await subject()
    expect(workspaceOnboardingCreationService).toHaveBeenCalled()
  })

  it('executes createDefaultsForNewUser service', async () => {
    await subject()
    expect(createDefaultsForNewUserService).toHaveBeenCalled()
  })

  it('executes setDefaultsForWorkspace service', async () => {
    await subject()
    expect(setDefaultsForWorkspaceService).toHaveBeenCalled()
  })
})
