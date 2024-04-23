import { cn } from '@/lib/utils'
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
  return (
    <Link href={`/c/${chatId}`}>
      <div
        className={cn(
          'group flex w-full grow basis-0 cursor-pointer items-center justify-between gap-x-2 rounded px-2 py-[6px] text-[14px] font-medium text-zinc-950 transition hover:bg-zinc-200/80 active:bg-zinc-300',
          isActive && 'bg-zinc-200',
        )}
      >
        <span className="grow basis-0">{title ?? 'Untitled chat'}</span>
      </div>
    </Link>
  )
}
