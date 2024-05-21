import { useDeleteAppFiles } from '@/components/posts/postsHooks'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { DocumentIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface UploadedFileProps {
  appId?: string
  appFileId?: string
  name: string
  uploading?: boolean
}

export const AppConfigForGPTUploadedFile = ({
  name,
  appId,
  appFileId,
  uploading = false,
}: UploadedFileProps) => {
  const { mutateAsync: deleteAppFiles } = useDeleteAppFiles()

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
