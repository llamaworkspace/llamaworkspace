import { createTRPCRouter } from '@/server/trpc/trpc'
import { createFileUploadPresignedUrl } from './procedures/createFileUploadPresignedUrl'
import { notifyAssetUploadSuccess } from './procedures/notifyAssetUploadSuccess'

export const assetsRouter = createTRPCRouter({
  createFileUploadPresignedUrl,
  notifyAssetUploadSuccess,
})
