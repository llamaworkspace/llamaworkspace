import {
  useAppFiles,
  useCreateFileUploadPresignedUrl,
  useDeleteAppFiles,
  useNotifyFileUploadSuccess,
} from '@/components/posts/postsHooks'
import { FileUploadInput } from '@/components/ui/FileUploadInput'
import { FormLabel } from '@/components/ui/forms/FormFieldWrapper'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { OPENAI_SUPPORTED_FILE_TYPES } from '@/server/posts/postConstants'
import { DocumentIcon, XCircleIcon } from '@heroicons/react/24/outline'
import type { AppFile } from '@prisma/client'
import { useState, type ChangeEvent } from 'react'

export const AppConfigForGPTFileUpload = ({ postId }: { postId?: string }) => {
  const [uploadableFiles, setUploadeableFiles] = useState<
    Record<string, AppFile>
  >({})

  const { mutateAsync: createFileUploadPresignedUrl } =
    useCreateFileUploadPresignedUrl()

  const { data: appFiles, refetch: refetchAppFiles } = useAppFiles(postId)
  const { mutateAsync: notifyFileUploadSuccess } = useNotifyFileUploadSuccess()

  const handleSingleFileUpload = async (file: File) => {
    if (!postId) return

    const { presignedUrl, appFile } = await createFileUploadPresignedUrl({
      postId,
      fileName: file.name,
    })

    setUploadeableFiles((prev) => ({ ...prev, [file.name]: appFile }))

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
      setUploadeableFiles((prev) => {
        const { [file.name]: _, ...rest } = prev
        return rest
      })
      await refetchAppFiles()

      console.log('File uploaded successfully')
    } else {
      console.error('Error uploading file', response.statusText)
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return

    Array.from(event.target.files).forEach(
      (file) => void handleSingleFileUpload(file),
    )
  }

  return (
    <div className="space-y-2">
      <FilesOrFutureFiles
        uploadedFiles={appFiles}
        uploadableFiles={uploadableFiles}
      />
      <FileUploadInput
        buttonText="Upload files"
        onChange={handleChange}
        type="file"
        multiple
        accept={OPENAI_SUPPORTED_FILE_TYPES}
      />
    </div>
  )
}

interface UploadableFilesProps {
  uploadedFiles?: AppFile[]
  uploadableFiles: Record<string, AppFile>
}

const FilesOrFutureFiles = ({
  uploadedFiles,
  uploadableFiles,
}: UploadableFilesProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <FormLabel>Knowledge</FormLabel>
        <div className="text-sm text-zinc-500">
          By uploading files here, you will be able to ask questions related to
          those files. Please note that the conversations with the AI may
          include extracts from the file.
        </div>
      </div>
      <div>
        {uploadedFiles && (
          <div className="grid gap-2 md:grid-cols-3">
            {Object.values(uploadedFiles).map((appFile) => (
              <UploadedFile
                key={appFile.id}
                appFileId={appFile.id}
                appId={appFile.appId}
                name={appFile.originalName}
              />
            ))}
            {uploadableFiles && (
              <>
                {Object.values(uploadableFiles).map((appFile) => (
                  <UploadedFile
                    key={appFile.id}
                    name={appFile.originalName}
                    uploading
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface UploadedFileProps {
  appId?: string
  appFileId?: string
  name: string
  uploading?: boolean
}

const UploadedFile = ({
  name,
  appId,
  appFileId,
  uploading = false,
}: UploadedFileProps) => {
  const { mutateAsync: deleteAppFiles } = useDeleteAppFiles()
  const { refetch: refetchAppFiles } = useAppFiles()
  const toast = useSuccessToast()
  const utils = api.useContext()

  const handleFileDelete = async () => {
    if (!appFileId) return
    if (!appId) return
    await deleteAppFiles({ appFileIds: [appFileId] })
    toast(undefined, 'File successfully deleted')
    await utils.posts.getAppFiles.invalidate()
  }
  return (
    <div className="grid cursor-default grid-cols-12 items-center justify-between rounded border p-2 text-sm">
      <div className="col-span-1">
        <DocumentIcon className="h-4 w-4" />
      </div>
      <div
        className={cn(
          'col-span-10 line-clamp-1',
          uploading && 'italic text-zinc-400',
        )}
      >
        {name}
      </div>
      <div className="col-span-1 flex justify-end">
        {!uploading && (
          <XCircleIcon
            className="h-5 w-5 cursor-pointer rounded-full text-zinc-500 hover:text-red-500"
            onClick={() => void handleFileDelete()}
          />
        )}
      </div>
    </div>
  )
}
