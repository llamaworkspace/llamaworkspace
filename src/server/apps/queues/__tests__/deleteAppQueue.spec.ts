import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { App, User, Workspace } from '@prisma/client'
import { deleteAppQueue } from '../deleteAppQueue'

const subject = async (payload: { userId: string; appId: string }) => {
  return await deleteAppQueue.call('deleteApp', payload)
}

describe('deleteAppQueue', () => {
  let workspace: Workspace
  let user: User
  let app: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      markAsDeletedAt: new Date(),
    })
  })

  it('deletes the app', async () => {
    await subject({ userId: user.id, appId: app.id })
    const appInDb = await prisma.app.findFirst({
      where: {
        id: app.id,
      },
    })
    expect(appInDb).toBeNull()
  })
})
