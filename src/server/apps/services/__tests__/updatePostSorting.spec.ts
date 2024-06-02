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
  let post1: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post1 = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  describe('when it is the first app with position', () => {
    it('adds position 1', async () => {
      await subject(workspace.id, user.id, post1.id)
      const postOnUser = await prisma.appsOnUsers.findFirstOrThrow({
        where: {
          appId: post1.id,
        },
      })

      expect(postOnUser.position).toBe(1)
    })
  })

  describe('when it is the not the first app with position', () => {
    let post2: App
    let post3: App

    beforeEach(async () => {
      post2 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      post3 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
    })

    it('adds position 1, moves position up for others', async () => {
      await subject(workspace.id, user.id, post2.id)
      await subject(workspace.id, user.id, post3.id)
      await subject(workspace.id, user.id, post1.id)

      const appsOnUsers = await prisma.appsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(appsOnUsers.find((aou) => aou.appId === post1.id)?.position).toBe(
        1,
      )
      expect(appsOnUsers.find((aou) => aou.appId === post2.id)?.position).toBe(
        3,
      )
      expect(appsOnUsers.find((aou) => aou.appId === post3.id)?.position).toBe(
        2,
      )
    })
  })

  describe('there are six or more apps with position', () => {
    let post2: App
    let post3: App
    let post4: App
    let post5: App
    let post6: App

    beforeEach(async () => {
      post2 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      post3 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      post4 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      post5 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      post6 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
    })

    it('removes item previously in position 5', async () => {
      await subject(workspace.id, user.id, post6.id)
      await subject(workspace.id, user.id, post5.id)
      await subject(workspace.id, user.id, post4.id)
      await subject(workspace.id, user.id, post2.id)
      await subject(workspace.id, user.id, post3.id)
      await subject(workspace.id, user.id, post1.id)

      const appsOnUsers = await prisma.appsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(appsOnUsers.find((aou) => aou.appId === post1.id)?.position).toBe(
        1,
      )
      expect(appsOnUsers.find((aou) => aou.appId === post2.id)?.position).toBe(
        3,
      )
      expect(appsOnUsers.find((aou) => aou.appId === post3.id)?.position).toBe(
        2,
      )
      expect(appsOnUsers.find((aou) => aou.appId === post4.id)?.position).toBe(
        4,
      )
      expect(appsOnUsers.find((aou) => aou.appId === post5.id)?.position).toBe(
        5,
      )
      expect(
        appsOnUsers.find((aou) => aou.appId === post6.id)?.position,
      ).toBeNull()
    })
  })

  describe('when the app already has a position', () => {
    let post2: App
    let post3: App

    beforeEach(async () => {
      post2 = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
    })

    it('does not update positions', async () => {
      await subject(workspace.id, user.id, post2.id)
      await subject(workspace.id, user.id, post1.id)

      const postOnUsers = await prisma.appsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(postOnUsers.find((aou) => aou.appId === post1.id)?.position).toBe(
        1,
      )
      expect(postOnUsers.find((aou) => aou.appId === post2.id)?.position).toBe(
        2,
      )
      await subject(workspace.id, user.id, post2.id)

      const postOnUsers2 = await prisma.appsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(postOnUsers2.find((aou) => aou.appId === post2.id)?.position).toBe(
        2,
      )
    })
  })
})
