import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { App, User, Workspace } from '@prisma/client'
import { createAppQueue } from '../createAppQueue'

jest.mock('@/server/ai/lib/AppEngineRunner/AppEngineRunner', () => {
  const AppEngineRunner = jest.fn()

  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  AppEngineRunner.prototype.onAppCreated = jest.fn()
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */

  return {
    AppEngineRunner,
  }
})

const subject = async (payload: { userId: string; appId: string }) => {
  return await createAppQueue.call('createApp', payload)
}

describe('createAppQueue', () => {
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

  it('invokes appEngineRunner.onAppCreated', async () => {
    await subject({ userId: user.id, appId: app.id })

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const onAppCreatedSpy = AppEngineRunner.prototype.onAppCreated as jest.Mock

    expect(onAppCreatedSpy).toHaveBeenCalledWith(app.id)
  })
})
