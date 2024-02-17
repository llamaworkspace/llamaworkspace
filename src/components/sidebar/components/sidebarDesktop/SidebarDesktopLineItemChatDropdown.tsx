import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { SidebarDesktopDeleteChat } from './SidebarDesktopDeleteChat/SidebarDesktopDeleteChat'

interface SidebarDesktopLineItemChatDropdownProps {
  chatId: string
  isHovered: boolean
  isLastChat: boolean
  isPrivate?: boolean
}

export function SidebarDesktopLineItemChatDropdown({
  chatId,
  isHovered,
  isLastChat,
  isPrivate,
}: SidebarDesktopLineItemChatDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            'h-5 w-5 rounded transition duration-200',
            isHovered || isOpen
              ? 'cursor-pointer opacity-100 hover:bg-zinc-300'
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
              <SidebarDesktopDeleteChat
                chatId={chatId}
                isPrivate={isPrivate}
                isLastChat={isLastChat}
              />
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
