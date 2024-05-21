import { AppFileStatus } from '@/components/posts/postsTypes'
import { env } from '@/env.mjs'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { scopePostByWorkspace } from '../postUtils'

const { S3_BUCKET_NAME, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
  env

const credentials = {
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
}
const s3Client = new S3Client({ region: S3_REGION, credentials })

interface CreateFileUploadPresignedUrlInputProps {
  postId: string
  fileName: string
}

export const createFileUploadPresignedUrlService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: CreateFileUploadPresignedUrlInputProps,
) => {
  const { userId, workspaceId } = uowContext
  const { postId, fileName } = input

  return await prismaAsTrx(prisma, async (prisma) => {
    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      postId,
    )

    await prisma.post.findFirstOrThrow({
      where: scopePostByWorkspace(
        {
          id: postId,
        },
        workspaceId,
      ),
    })

    const appFile = await createFileReference(prisma, {
      workspaceId,
      postId,
      originalName: fileName,
    })

    const { path } = appFile
    // Link a file to be uploaded, with status "pending", with the post
    // Assign the file an id, but keep the original name (avoids weird for namings in s3)
    // Generate url
    // onUploadSuccess => mark as uploaded

    const presignedUrl = await generatePresignedUrl(path)

    return { presignedUrl, appFile }
  })
}

interface CreateFileReferencePayload {
  workspaceId: string
  postId: string
  originalName: string
}

const createFileReference = async (
  prisma: PrismaTrxClient,
  payload: CreateFileReferencePayload,
) => {
  const { workspaceId, postId, originalName } = payload

  const splitFileName = originalName.split('.')
  const extension = splitFileName.length > 1 ? `.${splitFileName.pop()}` : ''
  const path = `workspaces/${workspaceId}/apps/${postId}${extension}`

  return await prisma.appFile.create({
    data: {
      appId: postId,
      status: AppFileStatus.Pending,
      originalName,
      path,
      extension,
    },
  })
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
