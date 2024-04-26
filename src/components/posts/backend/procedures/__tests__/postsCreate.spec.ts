import { prisma } from '@/server/db'
import { postCreateService } from '@/server/posts/services/postCreate.service'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'
import type { User, Workspace } from '@prisma/client'

type MockedPostCreateService = jest.MockedFunction<typeof postCreateService>

jest.mock('@/server/posts/services/postCreate.service')

const subject = async (workspaceId: string, userId: string, title: string) => {
  const payload = { workspaceId, title }

  const { caller } = trpcContextSetupHelper(prisma, userId)
  await caller.posts.create(payload)
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
