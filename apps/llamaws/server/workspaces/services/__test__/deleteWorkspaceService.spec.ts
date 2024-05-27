import type { Workspace } from '@prisma/client'
import { prisma } from 'server/db'
import { WorkspaceFactory } from 'server/testing/factories/WorkspaceFactory'
import { deleteWorkspaceService } from '../deleteWorkspace.service'

jest.mock('@/server/workspaces/services/setDefaultsForWorkspace.service')

const subject = async (workspaceId: string) => {
  return await deleteWorkspaceService(prisma, workspaceId)
}

describe('deleteWorkspaceService', () => {
  let workspace: Workspace

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
  })

  it('deletes the workspace', async () => {
    const workspaceInDb = await prisma.workspace.findFirstOrThrow({
      where: {
        id: workspace.id,
      },
    })
    expect(workspaceInDb).toBeDefined()
    await subject(workspace.id)

    const nextWorkspaceInDb = await prisma.workspace.findFirst({
      where: {
        id: workspace.id,
      },
    })

    expect(nextWorkspaceInDb).toBeNull()
  })
})
