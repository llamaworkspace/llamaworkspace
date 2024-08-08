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
import { bindAssetQueue } from '../../queues/bindAssetQueue'
import { bindAssetService } from '../bindAsset.service'

jest.mock('@/server/assets/queues/bindAssetQueue.ts', () => {
  return { bindAssetQueue: { enqueue: jest.fn() } }
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

  return await bindAssetService(prisma, uowContext, payload)
}

describe('bindAssetService', () => {
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

  describe('when the binding is with an app', () => {
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
      /* eslint-disable-next-line @typescript-eslint/unbound-method*/
      expect(bindAssetQueue.enqueue).toHaveBeenCalledWith('bindAsset', {
        userId: user.id,
        appId: app.id,
        assetId: asset.id,
      })
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
})
