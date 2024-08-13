import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { App, User, Workspace } from '@prisma/client'
import { ragIngestService } from '../ragIngestService'

jest.mock('@/server/apps/services/createDefaultApp.service')

const subject = async (
  workspaceId: string,
  userId: string,
  payload: { assetId: string; filePath: string },
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await ragIngestService(prisma, context, payload)
}

describe('ragIngestService', () => {
  let workspace: Workspace
  let user: User
  let app: App

  beforeEach(async () => {
    jest.clearAllMocks()

    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  xit('does thing', async () => {
    await subject(workspace.id, user.id, { assetId: 'fake', filePath: 'fake' })

    expect(true).toBeTruthy()
  })
})
