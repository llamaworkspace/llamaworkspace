import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useChatHistoryForSidebarPost } from '../../sidebarHooks'
import { SidebarDesktopLineItemChatDropdown } from './SidebarDesktopLineItemChatDropdown'

export const SidebarDesktopLineItemHistory = ({
  postId,
  currentChatId,
}: {
  postId: string
  currentChatId?: string
}) => {
  const { data: chatHistory } = useChatHistoryForSidebarPost(postId)

  const [firstThreeChatHistory, nextChatHistory] = useMemo(
    () => [chatHistory?.slice(0, 3), chatHistory?.slice(3)],
    [chatHistory],
  )

  const displayMoreButton = chatHistory && chatHistory.length > 3

  const [isMore, setIsMore] = useState(false)
  const handleMore = () => {
    setIsMore(!isMore)
  }
  return (
    <div className="mt-1 max-h-[180px] space-y-1 overflow-y-auto pl-6 text-[0.84rem]">
      {firstThreeChatHistory?.map((chat) => (
        <HistoryItem
          key={chat.id}
          chatId={chat.id}
          title={chat.title ?? 'Untitled chat'}
          postId={postId}
          isCurrent={chat.id === currentChatId}
          isLastChat={firstThreeChatHistory.length === 1}
        />
      ))}
      {isMore &&
        nextChatHistory?.map((chat) => {
          return (
            <HistoryItem
              key={chat.id}
              chatId={chat.id}
              title={chat.title ?? 'Untitled chat'}
              postId={postId}
              isCurrent={chat.id === currentChatId}
              isLastChat={false}
            />
          )
        })}
      {displayMoreButton && (
        <div className="cursor-pointer font-semibold text-zinc-600">
          <Button
            variant="link"
            size="paddingless"
            className="text-[0.84rem]"
            onClick={handleMore}
          >
            {isMore ? 'See less' : 'See more'}
          </Button>
        </div>
      )}
    </div>
  )
}

interface HistoryItemProps {
  chatId: string
  postId: string
  title: string
  isCurrent: boolean
  isLastChat: boolean
}

function HistoryItem({
  chatId,
  postId,
  title,
  isCurrent,
  isLastChat,
}: HistoryItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn('flex justify-between gap-2')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/p/${postId}/c/${chatId}`} className={cn('flex-grow')}>
        <div
          className={cn(
            'line-clamp-1 rounded p-0.5 text-zinc-700 transition',
            isCurrent &&
              'bg-zinc-200 font-semibold text-zinc-900 hover:bg-zinc-200/60',
          )}
        >
          {title}
        </div>
      </Link>

      <SidebarDesktopLineItemChatDropdown
        chatId={chatId}
        isHovered={isHovered}
        isLastChat={isLastChat}
      />
    </div>
  )
}
