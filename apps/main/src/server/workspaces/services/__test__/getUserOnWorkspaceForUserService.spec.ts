import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { UserRole } from '@/shared/globalTypes'
import type { User, Workspace } from '@prisma/client'
import { getUserOnWorkspaceForUserService } from '../getUserOnWorkspaceForUser.service'

interface Payload {
  userId: string
}

const subject = async (
  workspaceId: string,
  userId: string,
  payload: Payload,
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await getUserOnWorkspaceForUserService(prisma, context, payload)
}

describe('getUserOnWorkspaceForUserService', () => {
  let workspace: Workspace
  let user: User

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
  })

  it('gets the userOnWorkspace the user role', async () => {
    const result = await subject(workspace.id, user.id, {
      userId: user.id,
    })

    expect(result).toMatchObject({
      userId: user.id,
      role: UserRole.Admin,
    })
  })
})
