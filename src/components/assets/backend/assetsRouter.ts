import { createTRPCRouter } from '@/server/trpc/trpc'
import { createFileUploadPresignedUrl } from './procedures/createFileUploadPresignedUrl'

export const assetsRouter = createTRPCRouter({
  createFileUploadPresignedUrl,
})
