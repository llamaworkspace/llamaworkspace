import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'
import type { App, User, Workspace } from '@prisma/client'

const subject = async (userId: string, appId: string) => {
  const { caller } = trpcContextSetupHelper(prisma, userId)
  return await caller.chats.createChat({ appId })
}

describe('createChat', () => {
  let workspace: Workspace
  let user: User
  let app: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  it('creates a chat', async () => {
    const result = await subject(user.id, app.id)
    const dbChat = await prisma.chat.findFirstOrThrow({
      where: {
        app: {
          id: app.id,
        },
      },
    })
    expect(dbChat.id).toEqual(result.id)
  })

  it('creates a appsOnUsers record', async () => {
    await subject(user.id, app.id)
    const dbAppsOnUsers = await prisma.appsOnUsers.findFirstOrThrow({
      where: {
        appId: app.id,
        userId: user.id,
      },
    })
    expect(dbAppsOnUsers.lastVisitedAt).toBeDefined()
  })
})
