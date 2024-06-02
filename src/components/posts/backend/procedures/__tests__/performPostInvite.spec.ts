import { prisma } from '@/server/db'
import { performPostShareService } from '@/server/shares/services/performPostShare.service'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'
import type { App, User, Workspace } from '@prisma/client'

jest.mock('@/server/shares/services/performPostShare.service')

const subject = async (userId: string, appId: string, email: string) => {
  const { caller } = trpcContextSetupHelper(prisma, userId)
  return await caller.apps.share({ appId, email })
}

describe('performPostInvite', () => {
  let workspace: Workspace
  let invitingUser: User
  let invitedUser: User
  let app: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    invitingUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    invitedUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    app = await PostFactory.create(prisma, {
      userId: invitingUser.id,
      workspaceId: workspace.id,
    })
  })

  it('invokes performShare', async () => {
    await subject(invitingUser.id, app.id, invitedUser.email!)
    expect(performPostShareService).toHaveBeenCalled()
  })
})
