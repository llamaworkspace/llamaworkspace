import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { createDefaultPostService } from '@/server/posts/services/createDefaultPost.service'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { User, Workspace } from '@prisma/client'
import { addUserToWorkspaceService } from '../addUserToWorkspace.service'

jest.mock('@/server/posts/services/createDefaultPost.service')

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
    await subject(workspace.id, invitingUser.id, invitedUser.id)

    const workspaceInDb = await prisma.usersOnWorkspaces.findMany({
      where: {
        workspaceId: workspace.id,
        userId: invitingUser.id,
      },
    })

    expect(workspaceInDb).toHaveLength(1)
  })

  it('executes createDefaultPostService service', async () => {
    await subject(workspace.id, invitingUser.id, invitedUser.id)
    expect(createDefaultPostService).toHaveBeenCalled()
  })
})
