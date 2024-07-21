import { env } from '@/env.mjs'
import { S3Client } from '@aws-sdk/client-s3'

type S3Args = ConstructorParameters<typeof S3Client>

const {
  S3_BUCKET_NAME,
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_ENDPOINT,
} = env

const s3Config = {
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  region: S3_REGION,
  endpoint: S3_ENDPOINT ? S3_ENDPOINT : undefined,
  s3ForcePathStyle: S3_ENDPOINT ? true : undefined,
}

const baseS3Config = {
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
}

const remoteS3Config = {
  ...baseS3Config,
  region: S3_REGION,
}

const endpointBasedS3Config = {
  ...baseS3Config,
  endpoint: S3_ENDPOINT,
  s3ForcePathStyle: true,
}

const finalS3Config = S3_ENDPOINT ? endpointBasedS3Config : remoteS3Config

const s3Client = new S3Client(finalS3Config)

export const getS3Client = () => {
  return { s3Client, s3BucketName: S3_BUCKET_NAME }
}
