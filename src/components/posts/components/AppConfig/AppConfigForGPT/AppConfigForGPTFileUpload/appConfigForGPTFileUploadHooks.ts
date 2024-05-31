import {
  useBindAsset,
  useCreateFileUploadPresignedUrl,
  useNotifyAssetUploadSuccess,
} from '@/components/assets/assetsHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { api } from '@/lib/api'
import type { Asset } from '@prisma/client'
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
  const { mutateAsync: bindAsset } = useBindAsset()
  const utils = api.useContext()
  const { data: workspace } = useCurrentWorkspace()

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

      const response = await fetch(presignedUrl.url, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await notifyAssetUploadSuccess({ assetId: asset.id })
        onFileUploaded(file.name, asset)
        await bindAsset({ assetId: asset.id, appId })
        await utils.posts.getAppAssets.invalidate()
      } else {
        throw new Error('File upload filed')
      }
    },
    [
      createFileUploadPresignedUrl,
      notifyAssetUploadSuccess,
      onFileUploadStarted,
      onFileUploaded,
      workspace,
      appId,
      bindAsset,
      utils.posts.getAppAssets,
    ],
  )
}
