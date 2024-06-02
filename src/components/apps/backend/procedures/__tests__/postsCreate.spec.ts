import { postCreateService } from '@/server/apps/services/postCreate.service'
import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'
import type { User, Workspace } from '@prisma/client'

type MockedPostCreateService = jest.MockedFunction<typeof postCreateService>

jest.mock('@/server/apps/services/postCreate.service')

const subject = async (workspaceId: string, userId: string, title: string) => {
  const payload = { workspaceId, title }

  const { caller } = trpcContextSetupHelper(prisma, userId)
  await caller.apps.create(payload)
}

describe('postsCreate', () => {
  let workspace: Workspace
  let user: User

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    ;(postCreateService as MockedPostCreateService).mockClear()
  })

  it('calls postCreateService with proper params', async () => {
    await subject(workspace.id, user.id, 'Test title')
    expect(postCreateService).toHaveBeenCalled()
  })
})
