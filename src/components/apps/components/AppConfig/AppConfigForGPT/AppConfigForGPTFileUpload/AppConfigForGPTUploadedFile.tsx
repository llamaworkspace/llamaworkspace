import { useUnbindAsset } from '@/components/assets/assetsHooks'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { XCircleIcon } from '@heroicons/react/24/outline'

interface UploadedFileProps {
  name: string
  fileType: string
  appId?: string
  assetId?: string
  uploading?: boolean
}

export const AppConfigForGPTUploadedFile = ({
  name,
  fileType,
  appId,
  assetId,
  uploading = false,
}: UploadedFileProps) => {
  const { mutateAsync: unbindAsset } = useUnbindAsset()
  const toast = useSuccessToast()
  const utils = api.useContext()

  const handleFileDelete = async () => {
    if (!assetId) return
    if (!appId) return
    await unbindAsset({ assetId, appId })

    toast(undefined, 'File successfully deleted')
    await utils.apps.getAppAssets.invalidate()
  }

  return (
    <div className="grid cursor-default grid-cols-12 rounded border border-zinc-300 px-2 py-3 text-sm">
      <div className="col-span-2">
        <span
          className={cn(
            'rounded bg-fuchsia-200 px-1 py-0.5 text-xs font-bold uppercase text-fuchsia-700 ',
            uploading && 'opacity-50',
          )}
        >
          {fileType}
        </span>
      </div>
      <div
        className={cn(
          'col-span-9 line-clamp-2 h-10 text-sm font-medium tracking-tight text-zinc-700',
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
