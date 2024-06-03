import { useCreateChatForApp } from '@/components/chats/chatHooks'
import { useCanPerformActionForApp } from '@/components/permissions/permissionsHooks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DropdownMenuItemLink } from '@/components/ui/extensions/dropdown-menu'
import { EmojiWithFallback } from '@/components/ui/icons/EmojiWithFallback'
import type { RouterOutputs } from '@/lib/api'
import { cn } from '@/lib/utils'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import {
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid'

interface AppsListRowProps {
  app: RouterOutputs['apps']['getList'][0]
  onRowDelete: (appId: string) => void
}

export const AppsListRow = ({ app, onRowDelete }: AppsListRowProps) => {
  const { mutate: createChat } = useCreateChatForApp()

  const handleCreateChat = () => {
    createChat({ appId: app.id })
  }

  const handleDelete = () => {
    onRowDelete(app.id)
  }

  return (
    <div
      onClick={handleCreateChat}
      className={cn(
        'group grid grid-cols-12 rounded-lg py-3',
        'cursor-pointer bg-zinc-50 transition delay-0 duration-75 hover:bg-zinc-200 ',
      )}
    >
      <div className="flex items-start justify-center">
        <div className="col-span-2 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50">
          <EmojiWithFallback
            size={24}
            unified={app.emoji}
            fallbackClassName="h-6 w-6 text-zinc-400"
          />
        </div>
      </div>
      <div className="col-span-9 flex flex-col justify-center">
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
          <EllipsisDropdown appId={app.id} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}

interface EllipsisDropdownProps {
  appId: string
  onDelete: () => void
}

const EllipsisDropdown = ({ appId, onDelete }: EllipsisDropdownProps) => {
  const { data: canDelete, isLoading } = useCanPerformActionForApp(
    PermissionAction.Delete,
    appId,
  )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          onClick={(ev) => {
            ev.stopPropagation()
          }}
          className="flex h-8 w-8 transform items-center justify-center rounded duration-100 hover:bg-zinc-200"
        >
          <EllipsisHorizontalIcon className="h-6 w-6" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItemLink
          onClick={(ev) => {
            ev.stopPropagation()
          }}
          href={`/p/${appId}/configuration?backButton=false`}
        >
          <PencilIcon className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItemLink>
        <DropdownMenuItem
          onClick={(ev) => {
            ev.stopPropagation()
            ev.preventDefault()
            canDelete && onDelete()
          }}
          className={cn(
            !isLoading && !canDelete && 'cursor-not-allowed opacity-50',
          )}
        >
          <TrashIcon className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
