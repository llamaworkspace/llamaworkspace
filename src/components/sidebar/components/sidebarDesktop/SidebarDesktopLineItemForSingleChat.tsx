import { cn } from '@/lib/utils'
import Link from 'next/link'
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
        <Link href={href}>
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
                  {title}
                </div>
                <SidebarDesktopLineItemChatDropdown
                  isPrivate
                  chatId={id}
                  isHovered={true}
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
