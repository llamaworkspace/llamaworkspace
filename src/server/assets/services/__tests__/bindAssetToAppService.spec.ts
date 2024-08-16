import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { AssetOnAppStatus } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Asset, User, Workspace } from '@prisma/client'
import { bindAssetToAppQueue } from '../../queues/bindAssetToAppQueue'
import { bindAssetToAppService } from '../bindAssetToApp.service'

jest.mock('@/server/assets/queues/bindAssetToAppQueue.ts', () => {
  return { bindAssetToAppQueue: { enqueue: jest.fn() } }
})

const subject = async (
  workspaceId: string,
  userId: string,
  payload: {
    appId: string
    assetId: string
  },
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await bindAssetToAppService(prisma, uowContext, payload)
}

describe('bindAssetToAppService', () => {
  let workspace: Workspace
  let user: User
  let asset: Asset
  let app: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      title: 'A title',
    })
    asset = await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'test.png',
      uploadStatus: AssetUploadStatus.Success,
    })
  })

  it('performs the binding', async () => {
    const dbBefore = await prisma.assetsOnApps.findMany({
      where: {
        assetId: asset.id,
        appId: app.id,
      },
    })
    expect(dbBefore).toHaveLength(0)
    await subject(workspace.id, user.id, { appId: app.id, assetId: asset.id })
    const dbAfter = await prisma.assetsOnApps.findMany({
      where: {
        assetId: asset.id,
        appId: app.id,
      },
    })
    expect(dbAfter).toHaveLength(1)
    const assetOnApp = dbAfter[0]!
    expect(assetOnApp.status).toEqual(AssetOnAppStatus.Processing)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, { appId: app.id, assetId: asset.id })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Update,
      expect.anything(),
      expect.anything(),
    )
  })

  it('enqueues the asset binding', async () => {
    await subject(workspace.id, user.id, { appId: app.id, assetId: asset.id })

    const assetOnApp = await prisma.assetsOnApps.findFirstOrThrow({
      where: {
        assetId: asset.id,
        appId: app.id,
      },
    })
    /* eslint-disable-next-line @typescript-eslint/unbound-method*/
    expect(bindAssetToAppQueue.enqueue).toHaveBeenCalledWith('bindAssetToApp', {
      userId: user.id,
      assetOnAppId: assetOnApp.id,
    })
  })

  it('sets the model to GPT4o', async () => {
    await prisma.appConfigVersion.updateMany({
      where: {
        appId: app.id,
      },
      data: {
        model: 'openai/gpt-3.5-turbo',
      },
    })

    await subject(workspace.id, user.id, { appId: app.id, assetId: asset.id })

    const appConfigVersion = await prisma.appConfigVersion.findFirstOrThrow({
      where: {
        appId: app.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    expect(appConfigVersion.model).toBe('openai/gpt-4o')
  })

  it('sets the app engine type to Assistant', async () => {
    await prisma.app.update({
      where: {
        id: app.id,
      },
      data: {
        engineType: 'default',
      },
    })

    await subject(workspace.id, user.id, { appId: app.id, assetId: asset.id })

    const updatedApp = await prisma.app.findFirstOrThrow({
      where: {
        id: app.id,
      },
    })

    expect(updatedApp.engineType).toBe('assistant')
  })

  describe('when the asset does not have a "success" status', () => {
    it('throws', async () => {
      const unuploadedAsset = await AssetFactory.create(prisma, {
        workspaceId: workspace.id,
        originalName: 'test.png',
        uploadStatus: AssetUploadStatus.Pending,
      })
      await expect(
        subject(workspace.id, user.id, {
          appId: app.id,
          assetId: unuploadedAsset.id,
        }),
      ).rejects.toThrow()
    })
  })

  describe('when the asset is already uploaded', () => {
    it('does nothing', async () => {
      await subject(workspace.id, user.id, {
        appId: app.id,
        assetId: asset.id,
      })

      const assetsOnApps = await prisma.assetsOnApps.findMany({
        where: {
          appId: app.id,
          assetId: asset.id,
        },
      })

      expect(assetsOnApps).toHaveLength(1)
    })
  })
})
