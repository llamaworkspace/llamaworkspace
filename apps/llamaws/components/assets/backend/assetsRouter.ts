import { createTRPCRouter } from 'server/trpc/trpc'
import { bindAsset } from './procedures/bindAsset'
import { createFileUploadPresignedUrl } from './procedures/createFileUploadPresignedUrl'
import { notifyAssetUploadSuccess } from './procedures/notifyAssetUploadSuccess'
import { unbindAsset } from './procedures/unbindAsset'

export const assetsRouter = createTRPCRouter({
  createFileUploadPresignedUrl,
  notifyAssetUploadSuccess,
  bind: bindAsset,
  unbind: unbindAsset,
})
