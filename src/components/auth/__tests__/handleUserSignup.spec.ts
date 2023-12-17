import { onboardingCreateService } from '@/server/onboarding/services/onboardingCreate.service'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import mockDb from '@/server/testing/mockDb'
import { createDefaultsForNewUserService } from '@/server/users/services/createDefaultsForNewUser.service'
import { createWorkspaceForUserService } from '@/server/users/services/createWorkspaceForUser.service'
import { settlePostSharesForNewUserService } from '@/server/users/services/settlePostSharesForNewUser.service'
import { settleWorkspaceInvitesForNewUserService } from '@/server/users/services/settleWorkspaceInvitesForNewUser.service'
import { faker } from '@faker-js/faker'
import type { Workspace } from '@prisma/client'
import { handleUserSignup } from '../handleUserSignup'

jest.mock('@/server/users/services/createWorkspaceForUser.service')
jest.mock('@/server/users/services/settlePostSharesForNewUser.service')
jest.mock('@/server/users/services/settleWorkspaceInvitesForNewUser.service')
jest.mock('@/server/onboarding/services/onboardingCreate.service')
jest.mock('@/server/users/services/createDefaultsForNewUser.service')

type MockedCreateWorkspaceForUser = jest.MockedFunction<
  typeof createWorkspaceForUserService
>
type MockedSettlePostSharesForNewUser = jest.MockedFunction<
  typeof settlePostSharesForNewUserService
>
type MockedSettleWorkspaceInvitesForUser = jest.MockedFunction<
  typeof settleWorkspaceInvitesForNewUserService
>
type MockedOnboardingCreate = jest.MockedFunction<
  typeof onboardingCreateService
>
type MockedCreateDefaultsForNewUser = jest.MockedFunction<
  typeof createDefaultsForNewUserService
>

describe('handleUserSignup', () => {
  beforeEach(() => {
    ;(createWorkspaceForUserService as MockedCreateWorkspaceForUser).mockClear()
    ;(
      settlePostSharesForNewUserService as MockedSettlePostSharesForNewUser
    ).mockClear()
    ;(onboardingCreateService as MockedOnboardingCreate).mockClear()
    ;(
      createDefaultsForNewUserService as MockedCreateDefaultsForNewUser
    ).mockClear()
    ;(
      settleWorkspaceInvitesForNewUserService as MockedSettleWorkspaceInvitesForUser
    ).mockClear()
  })

  const subject = async () => {
    const mock = createWorkspaceForUserService as MockedCreateWorkspaceForUser
    const workspace = WorkspaceFactory.build({ id: faker.string.nanoid() })
    mock.mockResolvedValue(workspace as Workspace)
    const user = UserFactory.build({ id: faker.string.nanoid() })

    await handleUserSignup(mockDb, user.id!)
    return user
  }

  it('executes createWorkspaceForUserService service', async () => {
    await subject()
    expect(createWorkspaceForUserService).toHaveBeenCalled()
  })

  it('executes settlePostSharesForNewUser service', async () => {
    await subject()
    expect(settlePostSharesForNewUserService).toHaveBeenCalled()
  })

  it('executes settleWorkspaceInvitesForNewUser service', async () => {
    await subject()
    expect(settleWorkspaceInvitesForNewUserService).toHaveBeenCalled()
  })

  it('executes onboardingCreate service', async () => {
    await subject()
    expect(onboardingCreateService).toHaveBeenCalled()
  })

  it('executes createDefaultsForNewUser service', async () => {
    await subject()
    expect(createDefaultsForNewUserService).toHaveBeenCalled()
  })
})
