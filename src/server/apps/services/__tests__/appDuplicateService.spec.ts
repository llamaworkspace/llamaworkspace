import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { appDuplicateService } from '@/server/apps/services/appDuplicate.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { AssetsOnAppsFactory } from '@/server/testing/factories/AssetsOnAppsFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { Author } from '@/shared/aiTypesAndMappers'
import { ShareScope } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, User, Workspace } from '@prisma/client'
import _ from 'underscore'

jest.mock('@/server/assets/queues/bindAssetToAppQueue.ts', () => {
  return { bindAssetToAppQueue: { enqueue: jest.fn() } }
})

const subject = async (
  workspaceId: string,
  userId: string,
  payload: { appId: string },
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await appDuplicateService(prisma, uowContext, payload)
}

describe('appDuplicateService', () => {
  let workspace: Workspace
  let user: User
  let app: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    app = await AppFactory.create(prisma, {
      workspaceId: workspace.id,
      userId: user.id,
    })
  })

  it('duplicates the app', async () => {
    const nextApp = await subject(workspace.id, user.id, { appId: app.id })

    const appWithoutBaseAttrs = _.omit(nextApp, 'id', 'createdAt', 'updatedAt')
    expect(nextApp).toMatchObject({
      ...appWithoutBaseAttrs,
      title: `Copy of ${app.title}`,
    })
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, { appId: app.id })

    expect(spy).toHaveBeenNthCalledWith(
      1,
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })

  it('makes the app private', async () => {
    const nextApp = await subject(workspace.id, user.id, { appId: app.id })

    const share = await prisma.share.findFirstOrThrow({
      where: {
        appId: nextApp.id,
      },
    })
    expect(share.scope).toBe(ShareScope.Private)
  })

  it('duplicates the latest appConfigVersion', async () => {
    const nextApp = await subject(workspace.id, user.id, { appId: app.id })
    const baseAppConfigVersion = await prisma.appConfigVersion.findFirstOrThrow(
      {
        where: {
          appId: app.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    )

    const duplicatedAppConfigVersion =
      await prisma.appConfigVersion.findFirstOrThrow({
        where: {
          appId: nextApp.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

    expect(duplicatedAppConfigVersion).toMatchObject({
      model: baseAppConfigVersion.model,
      preprocessAssets: baseAppConfigVersion.preprocessAssets,
    })
  })

  it('duplicates the system messages', async () => {
    const baseAppConfigVersion = await prisma.appConfigVersion.findFirstOrThrow(
      {
        where: {
          appId: app.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          messages: {
            where: {
              author: Author.System,
            },
          },
        },
      },
    )

    await prisma.message.updateMany({
      where: {
        appConfigVersionId: baseAppConfigVersion.id,
        author: Author.System,
      },
      data: {
        message: 'updated message',
      },
    })

    const nextApp = await subject(workspace.id, user.id, { appId: app.id })

    const duplicatedAppConfigVersion =
      await prisma.appConfigVersion.findFirstOrThrow({
        where: {
          appId: nextApp.id,
        },
        include: {
          messages: {
            where: {
              author: Author.System,
            },
          },
        },
      })

    const partialFirstMessage = _.omit(duplicatedAppConfigVersion.messages[0], [
      'id',
      'appConfigVersionId',
      'chatId',
      'createdAt',
      'updatedAt',
    ])

    expect(duplicatedAppConfigVersion.messages[0]).toMatchObject({
      appConfigVersionId: duplicatedAppConfigVersion.id,
      ...partialFirstMessage,
    })
  })

  it('duplicates the linked files', async () => {
    const asset = await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'original.txt',
      uploadStatus: AssetUploadStatus.Success,
    })

    await AssetsOnAppsFactory.create(prisma, {
      assetId: asset.id,
      appId: app.id,
    })

    const nextApp = await subject(workspace.id, user.id, { appId: app.id })

    const assetsOnApps = await prisma.assetsOnApps.findMany({
      where: {
        appId: nextApp.id,
        assetId: asset.id,
      },
    })

    expect(assetsOnApps).toHaveLength(1)
  })
})
