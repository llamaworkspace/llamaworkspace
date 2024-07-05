import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { createDefaultsForNewUserService } from '@/server/users/services/createDefaultsForNewUser.service'
import * as createWorkspaceForUserServiceWrapper from '@/server/users/services/createWorkspaceForUser.service'
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
jest.mock('@/server/users/services/createDefaultsForNewUser.service')

const subject = async () => {
  const user = await UserFactory.create(prisma, {})

  await handleUserSignup(prisma, user.id)
  return user
}

describe('handleUserSignup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('executes createDefaultsForNewUser service', async () => {
    await subject()
    expect(createDefaultsForNewUserService).toHaveBeenCalled()
  })

  it('executes createWorkspaceForUserService service', async () => {
    await subject()
    expect(
      createWorkspaceForUserServiceWrapper.createWorkspaceForUserService,
    ).toHaveBeenCalled()
  })
})
