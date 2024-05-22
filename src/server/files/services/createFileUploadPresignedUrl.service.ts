import { FileUploadStatus } from '@/components/posts/postsTypes'
import { env } from '@/env.mjs'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

const { S3_BUCKET_NAME, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
  env

const credentials = {
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
}
const s3Client = new S3Client({ region: S3_REGION, credentials })

interface CreateFileUploadPresignedUrlInputProps {
  fileName: string
}

export const createFileUploadPresignedUrlService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: CreateFileUploadPresignedUrlInputProps,
) => {
  const { workspaceId } = uowContext
  const { fileName } = input

  return await prismaAsTrx(prisma, async (prisma) => {
    const file = await createFileReference(prisma, {
      workspaceId,
      originalName: fileName,
    })

    const { path } = file
    const presignedUrl = await generatePresignedUrl(path)

    return { presignedUrl, file }
  })
}

interface CreateFileReferencePayload {
  workspaceId: string
  originalName: string
}

const createFileReference = async (
  prisma: PrismaTrxClient,
  payload: CreateFileReferencePayload,
) => {
  const { workspaceId, originalName } = payload

  const splitFileName = originalName.split('.')
  const extension = splitFileName.length > 1 ? `.${splitFileName.pop()}` : ''

  let file = await prisma.file.create({
    data: {
      workspaceId,
      uploadStatus: FileUploadStatus.Pending,
      originalName,
      path: 'temp',
      extension,
    },
  })
  const path = `workspaces/${workspaceId}/${file.id}${extension}`
  file = await prisma.file.update({
    where: { id: file.id },
    data: { path },
  })
  return file
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
