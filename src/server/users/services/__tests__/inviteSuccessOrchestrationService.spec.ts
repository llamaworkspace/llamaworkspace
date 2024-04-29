import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { WorkspaceInviteFactory } from '@/server/testing/factories/WorkspaceInviteFactory'
import { addUserToWorkspaceService } from '@/server/workspaces/services/addUserToWorkspace.service'
import { deleteWorkspaceService } from '@/server/workspaces/services/deleteWorkspace.service'
import { faker } from '@faker-js/faker'
import type { User, Workspace, WorkspaceInvite } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { inviteSuccessOrchestrationService } from '../inviteSuccessOrchestration.service'

jest.mock('@/server/workspaces/services/deleteWorkspace.service')
jest.mock('@/server/workspaces/services/addUserToWorkspace.service')

const subject = async (invitedUserId: string, inviteToken: string) => {
  return await inviteSuccessOrchestrationService(
    prisma,
    invitedUserId,
    inviteToken,
  )
}

describe('inviteSuccessOrchestrationService', () => {
  let workspace: Workspace
  let invitedUser: User
  let email: string
  let workspaceInvite: WorkspaceInvite

  beforeEach(async () => {
    jest.clearAllMocks()
    workspace = await WorkspaceFactory.create(prisma)

    email = faker.internet.email()
    invitedUser = await UserFactory.create(prisma, {
      email,
      workspaceId: workspace.id,
    })

    workspaceInvite = await WorkspaceInviteFactory.create(prisma, {
      workspaceId: workspace.id,
      email,
    })
  })

  it('deletes default workspace for the user', async () => {
    const workspaceInDb = await prisma.usersOnWorkspaces.findMany({
      where: {
        workspaceId: workspace.id,
        userId: invitedUser.id,
      },
    })
    expect(workspaceInDb).toHaveLength(1)
    await subject(invitedUser.id, workspaceInvite.token)
    expect(deleteWorkspaceService).toHaveBeenCalled()
  })

  it('adds user to workspace', async () => {
    await subject(invitedUser.id, workspaceInvite.token)
    expect(addUserToWorkspaceService).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      {
        invitedUserId: invitedUser.id,
      },
    )
  })

  it('removes the user invites', async () => {
    const invitesBefore = await prisma.workspaceInvite.findMany({
      where: {
        email,
      },
    })
    expect(invitesBefore).toHaveLength(1)

    await subject(invitedUser.id, workspaceInvite.token)

    const invitesAfter = await prisma.workspaceInvite.findMany({
      where: {
        email,
      },
    })
    expect(invitesAfter).toHaveLength(0)
  })

  describe('when target workspace has more than one user (edge case)', () => {
    it('throws an error', async () => {
      await UserFactory.create(prisma, {
        workspaceId: workspace.id,
      })

      await expect(
        subject(invitedUser.id, workspaceInvite.token),
      ).rejects.toThrow(TRPCError)
    })
  })

  describe('when the email the user registers with is not invited to the workspace', () => {
    it('does nothing', async () => {
      await prisma.workspaceInvite.update({
        where: {
          id: workspaceInvite.id,
        },
        data: {
          email: faker.internet.email(),
        },
      })
      await subject(invitedUser.id, workspaceInvite.token)
      expect(deleteWorkspaceService).not.toHaveBeenCalled()
      expect(addUserToWorkspaceService).not.toHaveBeenCalled()
    })
  })
})
