import { useCreateChatForApp } from '@/components/chats/chatHooks'
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
import {
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid'

interface AppsListRowProps {
  post: RouterOutputs['posts']['getForAppsList'][0]
  onRowDelete: (postId: string) => void
}

export const AppsListRow = ({ post, onRowDelete }: AppsListRowProps) => {
  const { mutate: createChat } = useCreateChatForApp()

  const handleCreateChat = () => {
    createChat({ postId: post.id })
  }

  const handleDelete = () => {
    onRowDelete(post.id)
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
            unified={post.emoji}
            fallbackClassName="h-6 w-6 text-zinc-400"
          />
        </div>
      </div>
      <div className="col-span-9 flex flex-col justify-center">
        <div className="font-semibold">{post.title ?? 'Untitled'}</div>

        {/* Description text. If, when needed */}
        {post.latestConfig.description && (
          <div className="line-clamp-2 text-sm">
            {post.latestConfig.description}
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
          <EllipsisDropdown postId={post.id} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}

interface EllipsisDropdownProps {
  postId: string
  onDelete: () => void
}

const EllipsisDropdown = ({ postId, onDelete }: EllipsisDropdownProps) => {
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
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItemLink
          onClick={(ev) => {
            ev.stopPropagation()
          }}
          href={`/p/${postId}/configuration?backButton=false`}
        >
          <PencilIcon className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItemLink>
        <DropdownMenuItem
          onClick={(ev) => {
            ev.stopPropagation()
            onDelete()
          }}
        >
          <TrashIcon className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
