import {
  useAppFiles,
  useCreateFileUploadPresignedUrl,
  useNotifyFileUploadSuccess,
} from '@/components/posts/postsHooks'
import type { AppFile } from '@prisma/client'
import { useCallback } from 'react'

export const useUploadFile = (
  onFileUploadStarted: (fileName: string, appFile: AppFile) => void,
  onFileUploaded: (fileName: string, appFile: AppFile) => void,
  postId?: string,
) => {
  const { mutateAsync: createFileUploadPresignedUrl } =
    useCreateFileUploadPresignedUrl()
  const { mutateAsync: notifyFileUploadSuccess } = useNotifyFileUploadSuccess()
  const { refetch: refetchAppFiles } = useAppFiles(postId)

  return useCallback(
    async (file: File) => {
      if (!postId) return

      const { presignedUrl, appFile } = await createFileUploadPresignedUrl({
        postId,
        fileName: file.name,
      })

      onFileUploadStarted(file.name, appFile)

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
        await notifyFileUploadSuccess({ appFileId: appFile.id })
        onFileUploaded(file.name, appFile)

        await refetchAppFiles()

        console.log('File uploaded successfully')
      } else {
        console.error('Error uploading file', response.statusText)
      }
    },
    [
      refetchAppFiles,
      createFileUploadPresignedUrl,
      notifyFileUploadSuccess,
      postId,
      onFileUploadStarted,
      onFileUploaded,
    ],
  )
}
