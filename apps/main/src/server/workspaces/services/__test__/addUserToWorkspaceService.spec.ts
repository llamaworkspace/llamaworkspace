import { createDefaultAppService } from '@/server/apps/services/createDefaultApp.service'
import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { UserRole } from '@/shared/globalTypes'
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

    const workspacesInDb = await prisma.usersOnWorkspaces.findMany({
      where: {
        workspaceId: workspace.id,
        userId: invitedUser.id,
      },
    })

    expect(workspacesInDb).toHaveLength(1)
  })

  it('sets role as Member', async () => {
    await subject(workspace.id, invitedUser.id)

    const workspaceInDb = await prisma.usersOnWorkspaces.findFirstOrThrow({
      where: {
        workspaceId: workspace.id,
        userId: invitedUser.id,
      },
    })

    expect(workspaceInDb).toMatchObject({
      role: UserRole.Member,
    })
  })

  it('executes createDefaultAppService service', async () => {
    await subject(workspace.id, invitedUser.id)
    expect(createDefaultAppService).toHaveBeenCalled()
  })
})
