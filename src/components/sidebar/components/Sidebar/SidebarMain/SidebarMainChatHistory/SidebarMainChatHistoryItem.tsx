import { useSidebarButtonLikeStyles } from '@/components/sidebar/sidebarHooks'
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
  const baseStyles = useSidebarButtonLikeStyles(isActive)

  return (
    <Link href={`/c/${chatId}`}>
      <div className={cn(baseStyles, 'py-[6px] text-[14px] font-medium')}>
        <span className="grow basis-0">{title ?? 'Untitled chat'}</span>
      </div>
    </Link>
  )
}
