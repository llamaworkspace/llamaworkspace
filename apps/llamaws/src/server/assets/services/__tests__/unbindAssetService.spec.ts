import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { AssetsOnAppsFactory } from '@/server/testing/factories/AssetsOnAppsFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Asset, Post, User, Workspace } from '@prisma/client'
import { unbindAssetService } from '../unbindAsset.service'

const subject = async (
  workspaceId: string,
  userId: string,
  assetId: string,
  payload: {
    appId: string
  },
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await unbindAssetService(prisma, uowContext, {
    assetId,
    ...payload,
  })
}

describe('bindAssetService', () => {
  let workspace: Workspace
  let user: User
  let asset: Asset
  let app: Post

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    asset = await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'file.txt',
    })

    app = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    await AssetsOnAppsFactory.create(prisma, {
      assetId: asset.id,
      appId: app.id,
    })
  })

  describe('when the unbinding is with an app', () => {
    it('performs the unbinding', async () => {
      const dbBefore = await prisma.assetsOnApps.findMany({
        where: {
          assetId: asset.id,
          appId: app.id,
        },
      })
      expect(dbBefore).toHaveLength(1)
      await subject(workspace.id, user.id, asset.id, { appId: app.id })
      const dbAfter = await prisma.assetsOnApps.findMany({
        where: {
          assetId: asset.id,
          appId: app.id,
        },
      })
      expect(dbAfter).toHaveLength(0)
    })

    it('calls PermissionsVerifier', async () => {
      const spy = jest.spyOn(
        PermissionsVerifier.prototype,
        'passOrThrowTrpcError',
      )

      await subject(workspace.id, user.id, asset.id, { appId: app.id })

      expect(spy).toHaveBeenCalledWith(
        PermissionAction.Update,
        expect.anything(),
        expect.anything(),
      )
    })
  })
})
