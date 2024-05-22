import { useAppFiles } from '@/components/posts/postsHooks'
import { FileUploadInput } from '@/components/ui/FileUploadInput'
import { FormLabel } from '@/components/ui/forms/FormFieldWrapper'
import { OPENAI_SUPPORTED_FILE_TYPES } from '@/server/posts/postConstants'
import type { AppFile } from '@prisma/client'
import { useState, type ChangeEvent } from 'react'
import { AppConfigForGPTUploadedFile } from './AppConfigForGPTUploadedFile'
import { useUploadFile } from './appConfigForGPTFileUploadHooks'

export const AppConfigForGPTFileUpload = ({ postId }: { postId?: string }) => {
  const [uploadableFiles, setUploadeableFiles] = useState<
    Record<string, AppFile>
  >({})

  const onFileUploadStarted = (fileName: string, appFile: AppFile) => {
    setUploadeableFiles((prev) => ({ ...prev, [fileName]: appFile }))
  }
  const onFileUploaded = (fileName: string, appFile: AppFile) => {
    setUploadeableFiles((prev) => {
      const { [fileName]: _, ...rest } = prev
      return rest
    })
  }

  const uploadFile = useUploadFile(onFileUploadStarted, onFileUploaded)
  const { data: appFiles } = useAppFiles(postId)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return

    Array.from(event.target.files).forEach((file) => void uploadFile(file))
  }

  return (
    <div className="space-y-2">
      <UploadedAndUploadingFiles
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

const UploadedAndUploadingFiles = ({
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
              <AppConfigForGPTUploadedFile
                key={appFile.id}
                appFileId={appFile.id}
                appId={appFile.appId}
                name={appFile.originalName}
              />
            ))}
            {uploadableFiles && (
              <>
                {Object.values(uploadableFiles).map((appFile) => (
                  <AppConfigForGPTUploadedFile
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
