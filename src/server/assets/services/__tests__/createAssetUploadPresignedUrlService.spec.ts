import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { createPresignedApp } from '@aws-sdk/s3-presigned-post'
import type { User, Workspace } from '@prisma/client'
import { createAssetUploadPresignedUrlService } from '../createAssetUploadPresignedUrl.service'

jest.mock('@aws-sdk/s3-presigned-post', () => {
  return {
    createPresignedApp: jest.fn(() => {
      return {
        url: 'https://example.com',
      }
    }),
  }
})

const subject = async (
  workspaceId: string,
  userId: string,
  assetName: string,
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await createAssetUploadPresignedUrlService(prisma, uowContext, {
    assetName,
  })
}

describe('createAssetUploadPresignedUrlService', () => {
  let workspace: Workspace
  let user: User

  beforeEach(async () => {
    jest.clearAllMocks()
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
  })

  it('creates a file reference', async () => {
    const fileName = 'file.txt'

    await subject(workspace.id, user.id, fileName)
    const fileReference = await prisma.asset.findMany({
      where: {
        workspaceId: workspace.id,
      },
    })

    const expectedPath = `workspaces/${workspace.id}/${fileReference[0]!.id}.txt`

    expect(fileReference).toHaveLength(1)
    expect(fileReference[0]).toEqual(
      expect.objectContaining({
        workspaceId: workspace.id,
        uploadStatus: AssetUploadStatus.Pending,
        originalName: fileName,
        path: expectedPath,
      }),
    )
  })

  it('returns the presignedUrl and file entity', async () => {
    const fileName = 'file.txt'

    const response = await subject(workspace.id, user.id, fileName)

    expect(response.presignedUrl).toEqual({ url: 'https://example.com' })
    expect(response.asset).toEqual(
      expect.objectContaining({
        workspaceId: workspace.id,
        uploadStatus: AssetUploadStatus.Pending,
        originalName: fileName,
      }),
    )
  })

  it('generates an aws sdk url', async () => {
    const fileName = 'file.txt'

    const fileReference = await subject(workspace.id, user.id, fileName)
    const expectedPath = `workspaces/${workspace.id}/${fileReference.asset.id}.txt`

    expect(createPresignedApp).toHaveBeenCalledTimes(1)
    expect(createPresignedApp).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        Key: expectedPath,
      }),
    )
  })

  describe('when the file does not have an extension', () => {
    it('stores a file reference without an extension', async () => {
      const fileName = 'file'

      await subject(workspace.id, user.id, fileName)
      const filesInDb = await prisma.asset.findMany({
        where: {
          workspaceId: workspace.id,
        },
      })
      const expectedPath = `workspaces/${workspace.id}/${filesInDb[0]!.id}`

      expect(filesInDb).toHaveLength(1)
      expect(filesInDb[0]).toEqual(
        expect.objectContaining({
          workspaceId: workspace.id,
          uploadStatus: AssetUploadStatus.Pending,
          originalName: fileName,
          path: expectedPath,
        }),
      )
    })
  })
})
