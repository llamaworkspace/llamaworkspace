import { env } from '@/env.mjs'
import { fileOrFolderExists } from '@/lib/backend/nodeUtils'
import { generateToken } from '@/lib/utils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { TRPCError } from '@trpc/server'
import { createWriteStream } from 'fs'
import { mkdir, unlink } from 'fs/promises'
import path from 'path'
import internal from 'stream'
import { scopeAssetByWorkspace } from '../assetUtils'

const { S3_BUCKET_NAME, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
  env

const credentials = {
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
}
const s3Client = new S3Client({ region: S3_REGION, credentials })

const TEMP_DOWNLOADS_FOLDER = './tmp'

interface DownloadAssetPayload {
  assetId: string
}

export const downloadAssetFromS3Service = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: DownloadAssetPayload,
) => {
  const { assetId } = payload
  const { workspaceId, userId } = uowContext

  const asset = await checkUserHasPermissionOrThrow(
    prisma,
    workspaceId,
    userId,
    assetId,
  )

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: asset.path,
  })

  const response = await s3Client.send(command)

  if (!response.Body || !(response.Body instanceof internal.Readable)) {
    throw new Error('Response body is not a readable stream')
  }

  // Let's save this file locally
  const readable = response.Body

  if (!readable) {
    throw new Error('Response body is not a readable stream')
  }

  const randomFileName = `${asset.originalName}_${generateToken(16)}${asset.extension}`
  const targetFolder = path.join(process.cwd(), TEMP_DOWNLOADS_FOLDER)

  const folderExists = await fileOrFolderExists(targetFolder)

  if (!folderExists) {
    await mkdir(targetFolder, { recursive: true })
  }
  const targetFilePath = path.join(process.cwd(), '/tmp', randomFileName)

  const deleteFile = async () => {
    return unlink(targetFilePath)
  }

  const ostream = createWriteStream(targetFilePath)

  return new Promise<{ filePath: string; deleteFile: () => Promise<void> }>(
    (resolve, reject) => {
      readable.pipe(ostream)

      ostream.on('finish', () => {
        resolve({ filePath: targetFilePath, deleteFile })
      })

      ostream.on('error', (err) => {
        reject(err)
      })

      readable.on('error', (err) => {
        reject(err)
      })
    },
  )
}

const checkUserHasPermissionOrThrow = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
  assetId: string,
) => {
  const asset = await prisma.asset.findFirstOrThrow({
    where: scopeAssetByWorkspace({ id: assetId }, workspaceId),
    include: {
      assetsOnApps: {
        include: {
          app: true,
        },
        where: {
          markAsDeletedAt: null,
        },
      },
    },
  })

  const apps = asset.assetsOnApps.map((a) => a.app)

  if (!apps || apps.length === 0) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Asset is not associated with any apps',
    })
  }
  let hasPermission = false
  for (const app of apps) {
    hasPermission = await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      app.id,
    )

    if (hasPermission) {
      break
    }
  }
  return asset
}
