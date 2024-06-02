import { createDefaultAppService } from '@/server/apps/services/createDefaultApp.service'
import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { User, Workspace } from '@prisma/client'
import { addUserToWorkspaceService } from '../addUserToWorkspace.service'

jest.mock('@/server/apps/services/createDefaultApp.service')

const subject = async (workspaceId: string, invitedUserId: string) => {
  return await addUserToWorkspaceService(prisma, {
    workspaceId,
    userId: invitedUserId,
  })
}

describe('addUserToWorkspaceService', () => {
  let workspace: Workspace
  let invitingUser: User
  let invitedUser: User

  beforeEach(async () => {
    jest.clearAllMocks()

    workspace = await WorkspaceFactory.create(prisma)
    invitingUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    invitedUser = await UserFactory.create(prisma, {})
  })

  it('creates a new workspace linked to the user', async () => {
    await subject(workspace.id, invitedUser.id)

    const workspaceInDb = await prisma.usersOnWorkspaces.findMany({
      where: {
        workspaceId: workspace.id,
        userId: invitingUser.id,
      },
    })

    expect(workspaceInDb).toHaveLength(1)
  })

  it('executes createDefaultAppService service', async () => {
    await subject(workspace.id, invitedUser.id)
    expect(createDefaultAppService).toHaveBeenCalled()
  })
})
