import { env } from '@/env.mjs'
import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3'

const {
  S3_BUCKET_NAME,
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_ENDPOINT,
} = env

const baseS3Config: S3ClientConfig = {
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
}

const remoteS3Config: S3ClientConfig = {
  ...baseS3Config,
  region: S3_REGION,
}

const endpointBasedS3Config: S3ClientConfig = {
  ...baseS3Config,
  endpoint: S3_ENDPOINT,
  forcePathStyle: true,
}

const finalS3Config: S3ClientConfig = S3_ENDPOINT
  ? endpointBasedS3Config
  : remoteS3Config

const s3Client = new S3Client(finalS3Config)

export const getS3Client = () => {
  return { s3Client, s3BucketName: S3_BUCKET_NAME }
}
