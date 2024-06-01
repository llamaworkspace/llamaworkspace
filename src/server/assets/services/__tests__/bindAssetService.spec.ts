import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Asset, User, Workspace } from '@prisma/client'
import { bindAssetService } from '../bindAsset.service'

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

  return await bindAssetService(prisma, uowContext, {
    assetId,
    ...payload,
  })
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

    asset = await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'file.txt',
    })

    app = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
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
      await subject(workspace.id, user.id, asset.id, { appId: app.id })
      const dbAfter = await prisma.assetsOnApps.findMany({
        where: {
          assetId: asset.id,
          appId: app.id,
        },
      })
      expect(dbAfter).toHaveLength(1)
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
