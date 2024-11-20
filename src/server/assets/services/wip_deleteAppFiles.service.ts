import { getS3Client } from '@/lib/backend/s3Utils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import Promise from 'bluebird'
import { scopeAssetByWorkspace } from '../assetUtils'

const { s3Client, s3BucketName } = getS3Client()

interface DeleteAppFilesPayload {
  appFileIds: string[]
}

export async function WIPdeleteAppFilesService(
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: DeleteAppFilesPayload,
) {
  const { appFileIds } = payload
  const { workspaceId } = uowContext

  await Promise.map(appFileIds, async (appFileId) => {
    return prismaAsTrx(prisma, async (prisma) => {
      const asset = await prisma.asset.findFirstOrThrow({
        where: scopeAssetByWorkspace({ id: appFileId }, workspaceId),
      })

      await prisma.asset.delete({ where: { id: appFileId } })

      const deleteObjectParams = {
        Bucket: s3BucketName,
        Key: asset.path,
      }
      const deleteObjectCommand = new DeleteObjectCommand(deleteObjectParams)
      await s3Client.send(deleteObjectCommand)
    })
  })
}
