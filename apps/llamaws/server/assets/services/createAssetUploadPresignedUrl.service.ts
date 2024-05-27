import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { AssetUploadStatus } from 'components/assets/assetTypes'
import { env } from 'env.mjs'
import type { UserOnWorkspaceContext } from 'server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from 'server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from 'shared/globalTypes'

const { S3_BUCKET_NAME, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
  env

const credentials = {
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
}
const s3Client = new S3Client({ region: S3_REGION, credentials })

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
  const bucketName = S3_BUCKET_NAME

  const params = {
    Bucket: bucketName,
    Key: path,
    Expires: 3600,
  }

  const presignedPost = await createPresignedPost(s3Client, params)

  return presignedPost
}
