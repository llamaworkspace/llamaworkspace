import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Asset, User, Workspace } from '@prisma/client'
import { appAttachAssetService } from '../appAttachAsset.service'

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

  return await appAttachAssetService(prisma, uowContext, payload)
}

describe('appAttachAssetService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let asset: Asset

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

  it('attaches the asset', async () => {
    await subject(workspace.id, user.id, { appId: app.id, assetId: asset.id })

    const assetsOnApps = await prisma.assetsOnApps.findMany({
      where: {
        appId: app.id,
        assetId: asset.id,
      },
    })

    expect(assetsOnApps).toHaveLength(1)
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
      await subject(workspace.id, user.id, { appId: app.id, assetId: asset.id })

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
