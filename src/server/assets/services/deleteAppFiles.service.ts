import { env } from '@/env.mjs'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { scopePostByWorkspace } from '@/server/posts/postUtils'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Promise } from 'bluebird'

const { S3_BUCKET_NAME, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
  env

const credentials = {
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
}

const s3Client = new S3Client({ region: S3_REGION, credentials })

interface DeleteAppFilesPayload {
  appFileIds: string[]
}

export async function deleteAppFilesService(
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: DeleteAppFilesPayload,
) {
  const { appFileIds } = payload
  const { userId, workspaceId } = uowContext

  await Promise.map(appFileIds, async (appFileId) => {
    return prismaAsTrx(prisma, async (prisma) => {
      const appFile = await prisma.appFile.findFirstOrThrow({
        where: {
          id: appFileId,
          app: scopePostByWorkspace({}, workspaceId),
        },
      })

      await new PermissionsVerifier(prisma).passOrThrowTrpcError(
        PermissionAction.Delete,
        userId,
        appFile.appId,
      )

      await prisma.appFile.delete({ where: { id: appFileId } })

      const deleteObjectParams = {
        Bucket: S3_BUCKET_NAME,
        Key: appFile.path,
      }
      const deleteObjectCommand = new DeleteObjectCommand(deleteObjectParams)
      await s3Client.send(deleteObjectCommand)
    })
  })
}
