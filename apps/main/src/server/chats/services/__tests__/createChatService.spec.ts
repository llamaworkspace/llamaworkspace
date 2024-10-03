import * as updateAppSortingServiceWrapper from '@/server/apps/services/updateAppSorting.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, User, Workspace } from '@prisma/client'
import { createChatService } from '../createChat.service'

jest.mock('@/server/apps/services/updateAppSorting.service', () => {
  const original = jest.requireActual(
    '@/server/apps/services/updateAppSorting.service',
  ) as unknown as typeof updateAppSortingServiceWrapper

  return {
    updateAppSortingService: jest.fn(original.updateAppSortingService),
  }
})

beforeEach(() => {
  jest.clearAllMocks()
})

const subject = async (workspaceId: string, userId: string, appId: string) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await createChatService(prisma, uowContext, { appId })
}

describe('createChatService', () => {
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
    })
  })

  it('creates a chat', async () => {
    const result = await subject(workspace.id, user.id, app.id)
    const dbChat = await prisma.chat.findFirstOrThrow({
      where: {
        app: {
          id: app.id,
        },
      },
    })
    expect(dbChat.id).toEqual(result.id)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )
    await subject(workspace.id, user.id, app.id)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })

  it('creates a appsOnUsers record', async () => {
    await subject(workspace.id, user.id, app.id)
    const dbAppsOnUsers = await prisma.appsOnUsers.findFirstOrThrow({
      where: {
        appId: app.id,
        userId: user.id,
      },
    })
    expect(dbAppsOnUsers.id).toBeDefined()
  })

  it('invokes updateAppSortingService', async () => {
    await subject(workspace.id, user.id, app.id)

    expect(
      updateAppSortingServiceWrapper.updateAppSortingService,
    ).toHaveBeenCalled()
  })

  describe('when the app is default', () => {
    let defaultApp: App

    beforeEach(async () => {
      defaultApp = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        isDefault: true,
      })
    })

    it('creates a appConfigVersion', async () => {
      const result = await subject(workspace.id, user.id, defaultApp.id)

      const dbAppConfigVersion = await prisma.appConfigVersion.findFirstOrThrow(
        {
          where: {
            appId: defaultApp.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      )

      expect(result.appConfigVersionId).toEqual(dbAppConfigVersion.id)
      expect(dbAppConfigVersion.model).toEqual(user.defaultModel)
    })

    it('does not update app sorting', async () => {
      await subject(workspace.id, user.id, defaultApp.id)
      expect(
        updateAppSortingServiceWrapper.updateAppSortingService,
      ).not.toHaveBeenCalled()
    })
  })
})
