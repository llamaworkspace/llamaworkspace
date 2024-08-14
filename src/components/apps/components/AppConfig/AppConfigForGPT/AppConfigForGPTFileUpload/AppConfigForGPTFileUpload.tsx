import { useAppAssets } from '@/components/apps/appsHooks'
import { FileUploadInput } from '@/components/ui/FileUploadInput'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormLabel } from '@/components/ui/forms/FormFieldWrapper'
import type { Asset, AssetsOnApps } from '@prisma/client'
import { useState, type ChangeEvent } from 'react'
import { AppConfigForGPTUploadedFile } from './AppConfigForGPTUploadedFile'
import { useUploadFile } from './appConfigForGPTFileUploadHooks'

interface AppConfigForGPTFileUploadProps {
  supportedFileTypes: string
  appId?: string
}

export const AppConfigForGPTFileUpload = ({
  appId,
  supportedFileTypes,
}: AppConfigForGPTFileUploadProps) => {
  const [uploadableFiles, setUploadeableFiles] = useState<
    Record<string, Asset>
  >({})

  const onFileUploadStarted = (fileName: string, appFile: Asset) => {
    setUploadeableFiles((prev) => ({ ...prev, [fileName]: appFile }))
  }
  const onFileUploaded = (fileName: string, appFile: Asset) => {
    setUploadeableFiles((prev) => {
      const { [fileName]: _, ...rest } = prev
      return rest
    })
  }

  const uploadFile = useUploadFile(onFileUploadStarted, onFileUploaded, appId)
  const { data: appFiles } = useAppAssets(appId)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return

    Array.from(event.target.files).forEach((file) => void uploadFile(file))
  }

  const maxFilesReached = appFiles && appFiles.length >= 10

  return (
    <div className="space-y-2">
      <div className="space-y-4">
        <div className="space-y-1">
          <FormLabel>Knowledge</FormLabel>
          <div className="text-sm text-zinc-500">
            By uploading files here, you will be able to ask questions related
            to those files. Please note that the conversations with the AI may
            include extracts from the file.
          </div>
        </div>
        <UploadedAndUploadingFiles
          appId={appId}
          uploadedFiles={appFiles}
          uploadableFiles={uploadableFiles}
        />
      </div>
      {!maxFilesReached && (
        <FileUploadInput
          buttonText="Upload files"
          onChange={handleChange}
          type="file"
          multiple
          accept={supportedFileTypes}
        />
      )}
      {maxFilesReached && (
        <div className="pt-4">
          <Alert variant="fuchsia" className="lg:max-w-[500px]">
            <AlertDescription className="space-y-2">
              You have reached the maximum of 10 uploadable files for this app.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}

type AssetWithAssetsOnApps = Asset & { assetsOnApps: AssetsOnApps[] }

interface UploadableFilesProps {
  appId?: string
  uploadableFiles: Record<string, Asset>
  uploadedFiles?: AssetWithAssetsOnApps[]
}

const UploadedAndUploadingFiles = ({
  appId,
  uploadedFiles,
  uploadableFiles,
}: UploadableFilesProps) => {
  return (
    <div>
      {uploadedFiles && (
        <div className="grid gap-2 md:grid-cols-3">
          {Object.values(uploadedFiles).map((asset) => {
            const assetOnApp = asset.assetsOnApps[0]!

            return (
              <AppConfigForGPTUploadedFile
                key={asset.id}
                assetId={asset.id}
                appId={appId}
                name={asset.originalName}
                fileType={asset.extension.replace('.', '')}
                processingStatus={assetOnApp.status}
                failureMessage={assetOnApp.failureMessage}
              />
            )
          })}
          {uploadableFiles && (
            <>
              {Object.values(uploadableFiles).map((appFile) => (
                <AppConfigForGPTUploadedFile
                  key={appFile.id}
                  name={appFile.originalName}
                  fileType={appFile.extension.replace('.', '')}
                  uploading
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
