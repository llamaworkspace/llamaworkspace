import { useUnbindAsset } from '@/components/assets/assetsHooks'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { ArrowPathIcon } from '@heroicons/react/24/solid'

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
    <div className="rounded border border-zinc-300 text-sm">
      <div className="grid cursor-default grid-cols-12 p-2">
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
          {name} and this iis a very long name that should be truncated
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
      <div className="bg-zinc-100 px-2 py-2">
        <div className="flex items-center gap-x-1 text-xs">
          {!uploading && (
            <div className="col-span-12 flex items-center gap-x-1 text-xs italic">
              <span className="text-zinc-500">Uploading...</span>
            </div>
          )}
          <div className="col-span-12 flex hidden items-center gap-x-1 text-xs">
            <ArrowPathIcon className="h-4 w-4 text-orange-500" />{' '}
            <span className="text-zinc-500">Processing...</span>
          </div>
          {/* <div className="col-span-12 flex items-center gap-x-1 text-xs">
        <span className="text-zinc-500">Processed</span>
      </div> */}
          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />{' '}
          <span className="text-zinc-500">Processing failed</span>
        </div>
      </div>
    </div>
  )
}
