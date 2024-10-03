import {
  useBindAssetToApp,
  useCreateFileUploadPresignedUrl,
  useNotifyAssetUploadSuccess,
} from '@/components/assets/assetsHooks'
import { useErrorHandler } from '@/components/global/errorHandlingHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { api } from '@/lib/api'
import type { Asset } from '@prisma/client'
import ky from 'ky'
import { useCallback } from 'react'

export const useUploadFile = (
  onFileUploadStarted: (fileName: string, file: Asset) => void,
  onFileUploaded: (fileName: string, file: Asset) => void,
  appId?: string,
) => {
  const { mutateAsync: createFileUploadPresignedUrl } =
    useCreateFileUploadPresignedUrl()
  const { mutateAsync: notifyAssetUploadSuccess } =
    useNotifyAssetUploadSuccess()
  const { mutateAsync: bindAssetToApp } = useBindAssetToApp()
  const utils = api.useContext()
  const { data: workspace } = useCurrentWorkspace()
  const errorHandler = useErrorHandler()

  return useCallback(
    async (file: File) => {
      if (!workspace) return
      if (!appId) return

      const { presignedUrl, asset } = await createFileUploadPresignedUrl({
        workspaceId: workspace.id,
        assetName: file.name,
      })

      onFileUploadStarted(file.name, asset)

      const formData = new FormData()
      Object.keys(presignedUrl.fields).forEach((key) => {
        formData.append(key, presignedUrl.fields[key]!)
      })
      formData.append('file', file)

      try {
        await ky(presignedUrl.url, {
          method: 'POST',
          body: formData,
          timeout: 1_800_000, // 30 minutes,
          retry: {
            limit: 3,
            maxRetryAfter: 600_000, // 10 minutes
          },
        })

        await notifyAssetUploadSuccess({ assetId: asset.id })

        onFileUploaded(file.name, asset)
        await bindAssetToApp({ assetId: asset.id, appId })
        await utils.apps.getAppAssets.invalidate()
      } catch (error) {
        errorHandler('Failed to upload file')(error)
      }
    },
    [
      createFileUploadPresignedUrl,
      notifyAssetUploadSuccess,
      onFileUploadStarted,
      onFileUploaded,
      workspace,
      appId,
      bindAssetToApp,
      utils.apps.getAppAssets,
      errorHandler,
    ],
  )
}
