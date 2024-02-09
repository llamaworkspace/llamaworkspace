import { useUpdateChat } from '@/components/chats/chatHooks'
import { Editable } from '@/components/ui/Editable'
import { cn } from '@/lib/utils'
import { DEFAULT_API_DEBOUNCE_MS } from '@/shared/globalConfig'
import Link from 'next/link'
import { useState } from 'react'
import { SidebarDesktopLineItemChatDropdown } from './SidebarDesktopLineItemChatDropdown'

interface SidebarDesktopLineItemForSingleChatProps {
  id: string
  title: string
  href: string
  isCurrent: boolean
}

export function SidebarDesktopLineItemForSingleChat({
  id,
  title,
  isCurrent = false,
  href,
}: SidebarDesktopLineItemForSingleChatProps) {
  const [isHovered, setIsHovered] = useState(false)

  const { mutate } = useUpdateChat(DEFAULT_API_DEBOUNCE_MS)
  const handleChange = (value: string) => {
    mutate({ id, title: value })
  }

  return (
    <li>
      <div
        className={cn(
          isCurrent
            ? 'bg-zinc-100'
            : 'text-zinc-700 transition hover:bg-zinc-50',
          'rounded-md p-1 text-sm',
        )}
      >
        <Link
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          href={href}
        >
          <div>
            <div
              className={cn(
                'group flex items-center gap-x-2 rounded-md leading-6',
                isCurrent
                  ? 'font-bold text-zinc-900'
                  : 'font-medium text-zinc-600 hover:text-zinc-600',
              )}
            >
              <div className="flex w-full items-center justify-between space-x-1">
                <div
                  className={cn(
                    'line-clamp-1 grow',
                    isCurrent ? 'text-zinc-900' : 'text-zinc-600',
                  )}
                >
                  <Editable
                    onChange={handleChange}
                    tagName="span"
                    placeholder="Untitled chat"
                    initialValue={title}
                    className={cn(
                      'line-clamp-1 grow text-sm font-medium leading-6',
                      isCurrent ? 'text-zinc-900' : 'text-zinc-600',
                    )}
                  />
                </div>
                <SidebarDesktopLineItemChatDropdown
                  isPrivate
                  chatId={id}
                  isHovered={isHovered}
                  isLastChat={false}
                />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </li>
  )
}
