import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { UserRole } from '@/shared/globalTypes'
import type { User, Workspace } from '@prisma/client'
import { updateUserRoleForWorkspaceService } from '../updateUserRoleForWorkspace.service'

const subject = async (workspaceId: string, userId: string, role: UserRole) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await updateUserRoleForWorkspaceService(prisma, context, {
    role,
  })
}

describe('updateUserRoleForWorkspaceService', () => {
  let workspace: Workspace
  let userWorkspaceOwner: User
  let userToUpdate: User

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    userWorkspaceOwner = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    userToUpdate = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
  })

  it('updates the user role', async () => {
    const dbBefore = await prisma.usersOnWorkspaces.findFirstOrThrow({
      where: {
        workspaceId: workspace.id,
        userId: userToUpdate.id,
      },
    })

    expect(dbBefore).toMatchObject({
      role: UserRole.Admin,
    })

    await subject(workspace.id, userToUpdate.id, UserRole.Member)

    const dbAfter = await prisma.usersOnWorkspaces.findFirstOrThrow({
      where: {
        workspaceId: workspace.id,
        userId: userToUpdate.id,
      },
    })

    expect(dbAfter).toMatchObject({
      role: UserRole.Member,
    })
  })

  describe('when the user is the owner', () => {
    it('throws an error', async () => {
      await expect(
        subject(workspace.id, userWorkspaceOwner.id, UserRole.Member),
      ).rejects.toThrow()
    })
  })
})
