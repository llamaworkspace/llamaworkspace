import { createTRPCRouter } from '@/server/trpc/trpc'
import { bindAssetToApp } from './procedures/bindAssetToApp'
import { createFileUploadPresignedUrl } from './procedures/createFileUploadPresignedUrl'
import { notifyAssetUploadSuccess } from './procedures/notifyAssetUploadSuccess'
import { unbindAsset } from './procedures/unbindAsset'

export const assetsRouter = createTRPCRouter({
  createFileUploadPresignedUrl,
  notifyAssetUploadSuccess,
  bindToApp: bindAssetToApp,
  unbind: unbindAsset,
})
