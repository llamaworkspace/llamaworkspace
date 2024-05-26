import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { Asset, User, Workspace } from '@prisma/client'
import { updateAssetService } from '../updateAsset.service'

const subject = async (
  workspaceId: string,
  userId: string,
  assetId: string,
  payload: {
    uploadStatus?: AssetUploadStatus
  } = {},
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await updateAssetService(prisma, uowContext, {
    assetId: assetId,
    ...payload,
  })
}

describe('updateAssetService', () => {
  let workspace: Workspace
  let user: User
  let asset: Asset

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    asset = await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'file.txt',
    })
  })

  it('updates the uploadStatus', async () => {
    const before = await prisma.asset.findFirstOrThrow({
      where: {
        id: asset.id,
      },
    })

    expect(before.uploadStatus).toBe(AssetUploadStatus.Pending)

    await subject(workspace.id, user.id, asset.id, {
      uploadStatus: AssetUploadStatus.Success,
    })

    const after = await prisma.asset.findFirstOrThrow({
      where: {
        id: asset.id,
      },
    })

    expect(after.uploadStatus).toBe(AssetUploadStatus.Success)
  })
})
