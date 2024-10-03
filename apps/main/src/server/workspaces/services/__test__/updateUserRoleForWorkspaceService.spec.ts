import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { UserRole } from '@/shared/globalTypes'
import type { User, Workspace } from '@prisma/client'
import { updateUserRoleForWorkspaceService } from '../updateUserRoleForWorkspace.service'

interface UpdateUserRoleForWorkspacePayload {
  userId: string
  role: UserRole
}

const subject = async (
  workspaceId: string,
  userId: string,
  payload: UpdateUserRoleForWorkspacePayload,
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await updateUserRoleForWorkspaceService(prisma, context, payload)
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

    await subject(workspace.id, userWorkspaceOwner.id, {
      role: UserRole.Member,
      userId: userToUpdate.id,
    })

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

  it('throws when the user is not an admin', async () => {
    await prisma.usersOnWorkspaces.update({
      where: {
        userId_workspaceId: {
          userId: userWorkspaceOwner.id,
          workspaceId: workspace.id,
        },
      },
      data: {
        role: UserRole.Member,
      },
    })

    await expect(
      subject(workspace.id, userWorkspaceOwner.id, {
        role: UserRole.Member,
        userId: userToUpdate.id,
      }),
    ).rejects.toThrow()
  })

  describe('when the user is the owner', () => {
    it('throws an error', async () => {
      await expect(
        subject(workspace.id, userWorkspaceOwner.id, {
          role: UserRole.Member,
          userId: userWorkspaceOwner.id,
        }),
      ).rejects.toThrow()
    })
  })
})
