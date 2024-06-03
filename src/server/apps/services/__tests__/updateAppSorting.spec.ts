import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { App, User, Workspace } from '@prisma/client'
import { updateAppSortingService } from '../updateAppSorting.service'

const subject = async (workspaceId: string, userId: string, appId: string) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await updateAppSortingService(prisma, uowContext, appId)
}

describe('updateAppSortingService', () => {
  let workspace: Workspace
  let user: User
  let app1: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app1 = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  describe('when it is the first app with position', () => {
    it('adds position 1', async () => {
      await subject(workspace.id, user.id, app1.id)
      const appOnUser = await prisma.appsOnUsers.findFirstOrThrow({
        where: {
          appId: app1.id,
        },
      })

      expect(appOnUser.position).toBe(1)
    })
  })

  describe('when it is the not the first app with position', () => {
    let app2: App
    let app3: App

    beforeEach(async () => {
      app2 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      app3 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
    })

    it('adds position 1, moves position up for others', async () => {
      await subject(workspace.id, user.id, app2.id)
      await subject(workspace.id, user.id, app3.id)
      await subject(workspace.id, user.id, app1.id)

      const appsOnUsers = await prisma.appsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(appsOnUsers.find((aou) => aou.appId === app1.id)?.position).toBe(1)
      expect(appsOnUsers.find((aou) => aou.appId === app2.id)?.position).toBe(3)
      expect(appsOnUsers.find((aou) => aou.appId === app3.id)?.position).toBe(2)
    })
  })

  describe('there are six or more apps with position', () => {
    let app2: App
    let app3: App
    let app4: App
    let app5: App
    let app6: App

    beforeEach(async () => {
      app2 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      app3 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      app4 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      app5 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      app6 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
    })

    it('removes item previously in position 5', async () => {
      await subject(workspace.id, user.id, app6.id)
      await subject(workspace.id, user.id, app5.id)
      await subject(workspace.id, user.id, app4.id)
      await subject(workspace.id, user.id, app2.id)
      await subject(workspace.id, user.id, app3.id)
      await subject(workspace.id, user.id, app1.id)

      const appsOnUsers = await prisma.appsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(appsOnUsers.find((aou) => aou.appId === app1.id)?.position).toBe(1)
      expect(appsOnUsers.find((aou) => aou.appId === app2.id)?.position).toBe(3)
      expect(appsOnUsers.find((aou) => aou.appId === app3.id)?.position).toBe(2)
      expect(appsOnUsers.find((aou) => aou.appId === app4.id)?.position).toBe(4)
      expect(appsOnUsers.find((aou) => aou.appId === app5.id)?.position).toBe(5)
      expect(
        appsOnUsers.find((aou) => aou.appId === app6.id)?.position,
      ).toBeNull()
    })
  })

  describe('when the app already has a position', () => {
    let app2: App
    let app3: App

    beforeEach(async () => {
      app2 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
    })

    it('does not update positions', async () => {
      await subject(workspace.id, user.id, app2.id)
      await subject(workspace.id, user.id, app1.id)

      const appOnUsers = await prisma.appsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(appOnUsers.find((aou) => aou.appId === app1.id)?.position).toBe(1)
      expect(appOnUsers.find((aou) => aou.appId === app2.id)?.position).toBe(2)
      await subject(workspace.id, user.id, app2.id)

      const appOnUsers2 = await prisma.appsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(appOnUsers2.find((aou) => aou.appId === app2.id)?.position).toBe(2)
    })
  })
})
