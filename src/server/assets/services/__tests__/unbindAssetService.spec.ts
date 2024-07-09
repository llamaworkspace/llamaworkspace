import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { AssetsOnAppsFactory } from '@/server/testing/factories/AssetsOnAppsFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Asset, User, Workspace } from '@prisma/client'
import { unbindAssetQueue } from '../../queues/unbindAssetQueue'
import { unbindAssetService } from '../unbindAsset.service'

jest.mock('@/server/assets/queues/unbindAssetQueue.ts', () => {
  return { unbindAssetQueue: { enqueue: jest.fn() } }
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

  return await unbindAssetService(prisma, uowContext, payload)
}

describe('unbindAssetService', () => {
  let workspace: Workspace
  let user: User
  let asset: Asset
  let app: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    asset = await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'file.txt',
    })

    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    await AssetsOnAppsFactory.create(prisma, {
      assetId: asset.id,
      appId: app.id,
    })
  })

  it('performs the unbinding', async () => {
    const dbBefore = await prisma.assetsOnApps.findMany({
      where: {
        assetId: asset.id,
        appId: app.id,
      },
    })
    expect(dbBefore).toHaveLength(1)
    await subject(workspace.id, user.id, { appId: app.id, assetId: asset.id })
    const dbAfter = await prisma.assetsOnApps.findMany({
      where: {
        assetId: asset.id,
        appId: app.id,
      },
    })
    expect(dbAfter).toHaveLength(1)
    expect(dbAfter[0]!.markAsDeletedAt).toBeDefined()
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
    /* eslint-disable-next-line @typescript-eslint/unbound-method*/
    expect(unbindAssetQueue.enqueue).toHaveBeenCalledWith('unbindAsset', {
      userId: user.id,
      appId: app.id,
      assetId: asset.id,
    })
  })
})
