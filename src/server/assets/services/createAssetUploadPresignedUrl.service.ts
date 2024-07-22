import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { getS3Client } from '@/lib/backend/s3Utils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

const { s3Client, s3BucketName } = getS3Client()

interface CreateAssetUploadPresignedUrlInputProps {
  assetName: string
}

export const createAssetUploadPresignedUrlService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: CreateAssetUploadPresignedUrlInputProps,
) => {
  const { workspaceId } = uowContext
  const { assetName } = input

  return await prismaAsTrx(prisma, async (prisma) => {
    const asset = await createAssetReference(prisma, {
      workspaceId,
      originalName: assetName,
    })

    const { path } = asset
    const presignedUrl = await generatePresignedUrl(path)

    return { presignedUrl, asset }
  })
}

interface CreateAssetReferencePayload {
  workspaceId: string
  originalName: string
}

const createAssetReference = async (
  prisma: PrismaTrxClient,
  payload: CreateAssetReferencePayload,
) => {
  const { workspaceId, originalName } = payload

  const splitAssetName = originalName.split('.')
  const extension = splitAssetName.length > 1 ? `.${splitAssetName.pop()}` : ''

  let asset = await prisma.asset.create({
    data: {
      workspaceId,
      uploadStatus: AssetUploadStatus.Pending,
      originalName,
      path: 'temp',
      extension,
    },
  })
  const path = `workspaces/${workspaceId}/${asset.id}${extension}`
  asset = await prisma.asset.update({
    where: { id: asset.id },
    data: { path },
  })
  return asset
}

const generatePresignedUrl = async (path: string) => {
  const bucketName = s3BucketName

  const params = {
    Bucket: bucketName,
    Key: path,
    Expires: 3600,
  }

  return await createPresignedPost(s3Client, params)
}
