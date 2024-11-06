import { AssetUploadStatus } from '@/components/assets/assetTypes'
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
import { getAssetsService } from '../getAssets.service'

const subject = async (workspaceId: string, userId: string, appId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getAssetsService(prisma, context, { appId })
}

describe('getAssetsService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let file1: Asset
  let file2ForApp1: Asset
  let file3ForApp2: Asset

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    file1 = await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'file.txt',
      uploadStatus: AssetUploadStatus.Success,
    })

    file2ForApp1 = await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'file.txt',
      uploadStatus: AssetUploadStatus.Success,
    })

    file3ForApp2 = await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'file.txt',
      uploadStatus: AssetUploadStatus.Success,
    })

    await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'file.txt',
      uploadStatus: AssetUploadStatus.Pending,
    })
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

  it('returns the apps linked to the appId', async () => {
    await AssetsOnAppsFactory.create(prisma, {
      assetId: file2ForApp1.id,
      appId: app.id,
    })
    const otherAsset = await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'file.txt',
      uploadStatus: AssetUploadStatus.Success,
    })
    await AssetsOnAppsFactory.create(prisma, {
      assetId: otherAsset.id,
      appId: app.id,
      markAsDeletedAt: new Date(),
    })

    const result = await subject(workspace.id, user.id, app.id)

    expect(result).toHaveLength(1)
    expect(result[0]!.id).toEqual(file2ForApp1.id)
  })
})
