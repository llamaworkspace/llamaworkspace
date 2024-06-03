import { appCreateService } from '@/server/apps/services/appCreate.service'
import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'
import type { User, Workspace } from '@prisma/client'

type MockedAppCreateService = jest.MockedFunction<typeof appCreateService>

jest.mock('@/server/apps/services/appCreate.service')

const subject = async (workspaceId: string, userId: string, title: string) => {
  const payload = { workspaceId, title }

  const { caller } = trpcContextSetupHelper(prisma, userId)
  await caller.apps.create(payload)
}

describe('appsCreate', () => {
  let workspace: Workspace
  let user: User

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    ;(appCreateService as MockedAppCreateService).mockClear()
  })

  it('calls appCreateService with proper params', async () => {
    await subject(workspace.id, user.id, 'Test title')
    expect(appCreateService).toHaveBeenCalled()
  })
})
