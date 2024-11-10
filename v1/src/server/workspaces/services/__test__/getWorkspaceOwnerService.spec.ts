import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { User, Workspace } from '@prisma/client'
import { getWorkspaceOwnerService } from '../getWorkspaceOwner.service'

const subject = async (workspaceId: string, userId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await getWorkspaceOwnerService(prisma, context)
}

describe('getWorkspaceOwnerService', () => {
  let workspace: Workspace
  let userWorkspaceOwner: User
  let userWorkspaceMember: User

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    userWorkspaceOwner = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    userWorkspaceMember = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
  })

  describe('when the request relates to the owner', () => {
    it('returns the owner', async () => {
      const owner = await subject(workspace.id, userWorkspaceOwner.id)

      expect(owner).toMatchObject({
        id: userWorkspaceOwner.id,
      })
    })
  })

  describe('when the request relates to a member', () => {
    it('returns the owner', async () => {
      const owner = await subject(workspace.id, userWorkspaceMember.id)

      expect(owner).toMatchObject({
        id: userWorkspaceOwner.id,
      })
    })
  })
})
