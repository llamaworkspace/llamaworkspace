import { useDeleteChat } from '@/components/chats/chatHooks'
import { useSidebarButtonLikeStyles } from '@/components/sidebar/sidebarHooks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { TrashIcon } from '@heroicons/react/24/outline'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

interface ChatHistoryTimeBlockItemProps {
  title?: string | null
  chatId: string
  isActive?: boolean
}

export const SidebarMainChatHistoryItem = ({
  title,
  chatId,
  isActive = false,
}: ChatHistoryTimeBlockItemProps) => {
  const baseStyles = useSidebarButtonLikeStyles(isActive)
  const { mutate: deleteChat } = useDeleteChat()

  return (
    <Link href={`/c/${chatId}`}>
      <div className={cn(baseStyles, 'py-[6px] text-[14px] font-medium')}>
        <span className="line-clamp-1 grow basis-0">
          {title ?? 'Untitled chat'}
        </span>

        <EllipsisDropdown onDelete={() => deleteChat({ id: chatId })} />
      </div>
    </Link>
  )
}
interface EllipsisDropdownProps {
  onDelete: () => void
}

const EllipsisDropdown = ({ postId, onDelete }: EllipsisDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          onClick={(ev) => {
            ev.preventDefault()
            ev.stopPropagation()
            onDelete()
          }}
          className="w-[20px] rounded transition duration-100 hover:bg-zinc-300"
        >
          <EllipsisHorizontalIcon className="hidden h-5 w-5 text-zinc-950 transition duration-100 group-hover:block" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
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
