import { useCreateChatForApp } from '@/components/chats/chatHooks'
import { EmojiWithFallback } from '@/components/ui/icons/EmojiWithFallback'
import type { RouterOutputs } from '@/lib/api'
import { cn } from '@/lib/utils'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { AppOptionsDropdown } from './AppOptionsDropdown'

interface AppsListRowProps {
  app: RouterOutputs['apps']['getList'][0]
  canDelete: boolean
  canDuplicate: boolean
}

export const AppsListRow = ({
  app,
  canDuplicate,
  canDelete,
}: AppsListRowProps) => {
  const { mutate: createChat } = useCreateChatForApp()

  const handleCreateChat = () => {
    createChat({ appId: app.id })
  }

  return (
    <div
      className={cn(
        'group grid grid-cols-12 rounded-lg py-3',
        'cursor-pointer bg-zinc-50 transition delay-0 duration-75 hover:bg-zinc-200 ',
      )}
    >
      <div
        onClick={handleCreateChat}
        className="flex items-start justify-center"
      >
        <div className="col-span-2 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50">
          <EmojiWithFallback
            size={24}
            unified={app.emoji}
            fallbackClassName="h-6 w-6 text-zinc-400"
          />
        </div>
      </div>
      <div
        onClick={handleCreateChat}
        className="col-span-9 flex flex-col justify-center"
      >
        <div className="line-clamp-1 font-semibold">
          {app.title ?? 'Untitled'}
        </div>

        {/* Description text. If, when needed */}
        {app.latestConfig.description && (
          <div className="line-clamp-2 text-sm">
            {app.latestConfig.description}
          </div>
        )}
      </div>
      <div className="col-span-2 flex items-center justify-end gap-x-2 pr-2">
        <div
          className={cn(
            'flex h-8 w-8 transform items-center justify-center rounded opacity-0 duration-100',
            'group-hover:opacity-100',
          )}
        >
          <PencilSquareIcon className="h-5 w-5" />
        </div>
        <div
          className={cn(
            'flex h-8 w-8 transform items-center justify-center rounded duration-100',
            'hover:bg-zinc-200',
          )}
        >
          <AppOptionsDropdown
            appId={app.id}
            canDelete={canDelete}
            canDuplicate={canDuplicate}
          />
        </div>
      </div>
    </div>
  )
}
