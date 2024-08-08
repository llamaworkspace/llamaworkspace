import { useUnbindAsset } from '@/components/assets/assetsHooks'
import { useSuccessToast } from '@/components/ui/toastHooks'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AssetOnAppStatus } from '@/shared/globalTypes'
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

interface UploadedFileProps {
  name: string
  fileType: string
  appId?: string
  assetId?: string
  uploading?: boolean
  processingStatus?: string
  failureMessage?: string | null
}

enum State {
  Uploading,
  Processing,
  Success,
  Failed,
}

export const AppConfigForGPTUploadedFile = ({
  name,
  fileType,
  appId,
  assetId,
  processingStatus,
  failureMessage,
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

  const state = getDerivedState(uploading, processingStatus)

  return (
    <div className="rounded border border-zinc-300 text-sm">
      <div className="grid cursor-default grid-cols-12 p-2">
        <div className="col-span-2">
          <span
            className={cn(
              'rounded bg-fuchsia-200 px-1 py-0.5 text-[0.6rem] font-semibold uppercase text-fuchsia-700 ',
              uploading && 'opacity-50',
            )}
          >
            {fileType.substring(0, 4)}
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
      <div className="bg-zinc-100 px-2 py-2">
        <div className="flex items-center gap-x-1 text-xs">
          <div className="col-span-12 flex min-h-4 items-center gap-x-1 text-xs">
            {state === State.Uploading && (
              <span className="italic text-zinc-500">Uploading...</span>
            )}

            {state === State.Processing && (
              <span className="text-zinc-500">Processing...</span>
            )}
            {state === State.Success && (
              <>
                <CheckCircleIcon className="h-4 w-4 text-green-500" />{' '}
                <span className="text-zinc-500">Processed</span>
              </>
            )}
            {state === State.Failed && (
              <>
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />{' '}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-red-500">
                      Processing failed
                    </span>
                  </TooltipTrigger>

                  <TooltipContent>{failureMessage}</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const getDerivedState = (isUploading: boolean, processingStatus?: string) => {
  if (isUploading) return State.Uploading

  if (processingStatus === AssetOnAppStatus.Processing.toString())
    return State.Processing
  if (processingStatus === AssetOnAppStatus.Success.toString())
    return State.Success
  if (processingStatus === AssetOnAppStatus.Failed.toString())
    return State.Failed

  return null
}
