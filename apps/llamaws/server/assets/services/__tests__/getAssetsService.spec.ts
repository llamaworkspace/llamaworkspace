import type { Asset, Post, User, Workspace } from '@prisma/client'
import { AssetUploadStatus } from 'components/assets/assetTypes'
import { createUserOnWorkspaceContext } from 'server/auth/userOnWorkspaceContext'
import { prisma } from 'server/db'
import { PermissionsVerifier } from 'server/permissions/PermissionsVerifier'
import { AssetFactory } from 'server/testing/factories/AssetFactory'
import { AssetsOnAppsFactory } from 'server/testing/factories/AssetsOnAppsFactory'
import { PostFactory } from 'server/testing/factories/PostFactory'
import { UserFactory } from 'server/testing/factories/UserFactory'
import { WorkspaceFactory } from 'server/testing/factories/WorkspaceFactory'
import { PermissionAction } from 'shared/permissions/permissionDefinitions'
import { getAssetsService } from '../getAssets.service'

const subject = async (workspaceId: string, userId: string, appId?: string) => {
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
  let app: Post
  let file1: Asset
  let file2ForApp1: Asset
  let file3ForApp2: Asset

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await PostFactory.create(prisma, {
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

  it('returns the posts', async () => {
    const result = await subject(workspace.id, user.id)
    expect(result).toHaveLength(3)
    expect(result[0]!.id).toEqual(file1.id)
    expect(result[1]!.id).toEqual(file2ForApp1.id)
    expect(result[2]!.id).toEqual(file3ForApp2.id)
  })

  describe('when appId is provided', () => {
    it('calls PermissionsVerifier', async () => {
      const spy = jest.spyOn(
        PermissionsVerifier.prototype,
        'passOrThrowTrpcError',
      )
      await subject(workspace.id, user.id, app.id)

      expect(spy).toHaveBeenCalledWith(
        PermissionAction.Update,
        expect.anything(),
        expect.anything(),
      )
    })

    it('returns the posts linked to the appId', async () => {
      await AssetsOnAppsFactory.create(prisma, {
        assetId: file2ForApp1.id,
        appId: app.id,
      })
      const result = await subject(workspace.id, user.id, app.id)
      expect(result).toHaveLength(1)
      expect(result[0]!.id).toEqual(file2ForApp1.id)
    })
  })
})
