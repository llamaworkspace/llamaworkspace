import { cn } from '@/lib/utils'
import { Link } from '@chakra-ui/react'

interface SidebarMobileLineItemForSingleChatProps {
  title: string
  href: string
  isCurrent: boolean
}

export const SidebarMobileLineItemForSingleChat = ({
  title,
  href,
  isCurrent,
}: SidebarMobileLineItemForSingleChatProps) => {
  return (
    <li>
      <Link href={href}>
        <div
          className={cn(
            isCurrent
              ? 'bg-zinc-50 text-zinc-600'
              : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-600',
            'group flex gap-x-3 rounded-md px-2 py-1 text-sm font-semibold leading-6',
          )}
        >
          <span className="truncate">{title ?? 'Untitled chat'}</span>
        </div>
      </Link>
    </li>
  )
}
