import { env } from '@/env.mjs'
import { generateToken } from '@/lib/utils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createWriteStream } from 'fs'
import { unlink } from 'fs/promises'
import path from 'path'
import internal from 'stream'
import { scopeAssetByWorkspace } from '../assetUtils'

const root = process.cwd()

const { S3_BUCKET_NAME, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
  env

const credentials = {
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
}
const s3Client = new S3Client({ region: S3_REGION, credentials })

interface DownloadAssetPayload {
  assetId: string
}

export const readAssetService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: DownloadAssetPayload,
) => {
  const { assetId } = payload
  const { workspaceId } = uowContext
  const asset = await prisma.asset.findFirstOrThrow({
    where: scopeAssetByWorkspace({ id: assetId }, workspaceId),
  })
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
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

  const randomFileName = `${generateToken()}${asset.extension}`
  const incomingFilePath = path.join(process.cwd(), '/tmp', randomFileName)

  const deleteFile = async () => {
    return unlink(incomingFilePath)
  }

  const ostream = createWriteStream(incomingFilePath)
  return new Promise<{ filePath: string; deleteFile: () => Promise<void> }>(
    (resolve, reject) => {
      readable.pipe(ostream)

      ostream.on('finish', () => {
        resolve({ filePath: incomingFilePath, deleteFile })
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
