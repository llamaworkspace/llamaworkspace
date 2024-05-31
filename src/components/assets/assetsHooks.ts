import { api } from '@/lib/api'
import { useErrorHandler } from '../global/errorHandlingHooks'

export const useCreateFileUploadPresignedUrl = () => {
  const errorHandler = useErrorHandler()

  return api.assets.createFileUploadPresignedUrl.useMutation({
    onError: errorHandler(),
  })
}

export const useNotifyAssetUploadSuccess = () => {
  const errorHandler = useErrorHandler()

  return api.assets.notifyAssetUploadSuccess.useMutation({
    onError: errorHandler(),
  })
}

export const useBindAsset = () => {
  const errorHandler = useErrorHandler()

  return api.assets.bind.useMutation({
    onError: errorHandler(),
  })
}

export const useUnbindAsset = () => {
  const errorHandler = useErrorHandler()

  return api.assets.unbind.useMutation({
    onError: errorHandler(),
  })
}
