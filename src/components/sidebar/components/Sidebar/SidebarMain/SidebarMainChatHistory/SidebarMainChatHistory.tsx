import { useChatHistoryForSidebarPostV2 } from '@/components/sidebar/sidebarHooks'
import type { RouterOutputs } from '@/lib/api'
import { cn } from '@/lib/utils'

type ChatHistoryForSidebarOutput =
  RouterOutputs['sidebar']['chatHistoryForSidebarV2']

export const SidebarMainChatHistory = () => {
  const { data: chats } = useChatHistoryForSidebarPostV2()

  return (
    chats &&
    Object.entries<ChatHistoryForSidebarOutput>(chats).map(([title, chats]) => {
      return <ChatHistoryTimeBlock key={title} title={title} chats={chats} />
    })
  )
}

interface ChatHistoryTimeBlockProps {
  title: string
  chats: ChatHistoryForSidebarOutput
}

const ChatHistoryTimeBlock = ({ title, chats }: ChatHistoryTimeBlockProps) => {
  return (
    <div className="w-full space-y-1">
      <div className="px-2 text-xs font-bold uppercase text-zinc-400">
        {title}
      </div>
      <div className="w-full">
        {chats.map((chat) => {
          return <ChatItem key={chat.id} title={chat.title} />
        })}
      </div>
    </div>
  )
}

interface ChatHistoryTimeBlockItemProps {
  title?: string | null
  highlighted?: boolean
}

const ChatItem = ({ title, highlighted }: ChatHistoryTimeBlockItemProps) => {
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
