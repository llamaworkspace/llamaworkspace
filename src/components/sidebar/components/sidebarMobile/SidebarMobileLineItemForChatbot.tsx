import { cn } from '@/lib/utils'
import { Link } from '@chakra-ui/react'
import { useChatHistoryForSidebarPost } from '../../sidebarHooks'

interface SidebarMobileLineItemForChatAppProps {
  title: string
  href: string
  isCurrent: boolean
  postId: string
  currentChatId?: string
  postSortId?: string
}

export const SidebarMobileLineItemForChatbot = ({
  title,
  isCurrent,
  postId,
  currentChatId,
}: SidebarMobileLineItemForChatAppProps) => {
  const { data: chatHistory } = useChatHistoryForSidebarPost(
    isCurrent && postId ? postId : undefined,
  )
  return (
    <li>
      <div
        className={cn(
          isCurrent
            ? 'bg-zinc-50 text-zinc-600'
            : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-600',
          'group flex gap-x-3 rounded-md px-2 py-1 text-sm  leading-6',
        )}
      >
        <div className="w-full ">
          <div className="truncate font-semibold">
            {title ?? 'Untitled chat'}
          </div>
          <ul className=" space-y-0.5 pl-2">
            {chatHistory?.map((chat) => {
              return (
                <HistoryItem
                  key={chat.id}
                  chatId={chat.id}
                  postId={postId}
                  title={chat.title ?? 'Untitled chat'}
                  isCurrent={chat.id === currentChatId}
                />
              )
            })}
          </ul>
        </div>
      </div>
    </li>
  )
}

interface HistoryItemProps {
  chatId: string
  postId: string
  title: string
  isCurrent: boolean
}

function HistoryItem({ chatId, postId, title, isCurrent }: HistoryItemProps) {
  return (
    <li className={cn('flex w-full justify-between gap-2 ')}>
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
    </li>
  )
}
