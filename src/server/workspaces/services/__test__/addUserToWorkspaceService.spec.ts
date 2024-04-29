import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { setDefaultsForWorkspaceService } from '@/server/workspaces/services/setDefaultsForWorkspace.service'
import type { User } from '@prisma/client'
import { addUserToWorkspaceService } from '../addUserToWorkspace.service'

jest.mock('@/server/workspaces/services/setDefaultsForWorkspace.service')

const subject = async (
  workspaceId: string,
  invitingUserId: string,
  invitedUserId: string,
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    invitingUserId,
  )

  return await addUserToWorkspaceService(prisma, uowContext, { invitedUserId })
}

describe('addUserToWorkspaceService', () => {
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
})
