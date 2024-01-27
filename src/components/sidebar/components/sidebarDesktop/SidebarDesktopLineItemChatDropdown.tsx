import { useDeleteChat } from '@/components/chats/chatHooks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface SidebarDesktopLineItemChatDropdownProps {
  chatId: string
  isHovered: boolean
  isLastChat: boolean
  allowLastChatDeletion?: boolean
}

export function SidebarDesktopLineItemChatDropdown({
  chatId,
  isHovered,
  isLastChat,
  allowLastChatDeletion,
}: SidebarDesktopLineItemChatDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: deleteChat } = useDeleteChat()

  const handleDelete = () => {
    void deleteChat({ id: chatId, allowLastChatDeletion })
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            'h-5 w-5 transform rounded duration-200',
            isHovered || isOpen
              ? 'cursor-pointer opacity-100 hover:bg-zinc-200'
              : 'opacity-0',
          )}
        >
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownMenuItem disabled={isLastChat} onSelect={handleDelete}>
                  <TrashIcon className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </div>
            </TooltipTrigger>
            {isLastChat && (
              <TooltipContent>
                You can&apos;t delete the last chat
              </TooltipContent>
            )}
          </Tooltip>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
