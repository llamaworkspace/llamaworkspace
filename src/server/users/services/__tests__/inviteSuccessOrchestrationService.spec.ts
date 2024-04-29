import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { deleteWorkspaceService } from '@/server/workspaces/services/deleteWorkspace.service'
import type { User, Workspace } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { inviteSuccessOrchestrationService } from '../inviteSuccessOrchestration.service'

jest.mock('@/server/workspaces/services/deleteWorkspace.service')

const subject = async (userId: string) => {
  return await inviteSuccessOrchestrationService(prisma, userId)
}

describe('inviteSuccessOrchestrationService', () => {
  let workspace: Workspace
  let user: User

  beforeEach(async () => {
    jest.clearAllMocks()
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, { workspaceId: workspace.id })
  })

  describe('default workspace deletion', () => {
    it('deletes default workspace for the user', async () => {
      const workspaceInDb = await prisma.usersOnWorkspaces.findMany({
        where: {
          workspaceId: workspace.id,
          userId: user.id,
        },
      })
      expect(workspaceInDb).toHaveLength(1)
      await subject(user.id)
      expect(deleteWorkspaceService).toHaveBeenCalled()
    })

    describe('when target workspace has more than one user (edge case)', () => {
      it('throws an error', async () => {
        await UserFactory.create(prisma, {
          workspaceId: workspace.id,
        })
        await expect(subject(user.id)).rejects.toThrow(TRPCError)
      })
    })
  })
})
