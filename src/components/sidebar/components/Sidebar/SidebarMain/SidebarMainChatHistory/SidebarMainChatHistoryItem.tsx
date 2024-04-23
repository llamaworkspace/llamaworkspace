import { cn } from '@/lib/utils'

interface ChatHistoryTimeBlockItemProps {
  title?: string | null
  highlighted?: boolean
}

export const SidebarMainChatHistoryItem = ({
  title,
  highlighted,
}: ChatHistoryTimeBlockItemProps) => {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-2 rounded px-2 py-[6px] text-[14px] font-medium text-zinc-950',
        highlighted && 'bg-zinc-950 text-white',
        !highlighted && 'text-zinc-950',
      )}
    >
      <span className="grow basis-0">{title ?? 'Untitled chat'}</span>
    </div>
  )
}
