import type { RouterOutputs } from '@/lib/api'
import { SidebarMainChatHistoryItem } from './SidebarMainChatHistoryItem'

type ChatHistoryForSidebarOutput =
  RouterOutputs['sidebar']['chatHistoryForSidebarV2']

interface ChatHistoryTimeBlockProps {
  title: string
  chats: ChatHistoryForSidebarOutput
}

export const SidebarMainChatHistoryTimeBlock = ({
  title,
  chats,
}: ChatHistoryTimeBlockProps) => {
  return (
    <div className="w-full space-y-1">
      <div className="px-2 text-xs font-bold uppercase text-zinc-400">
        {title}
      </div>
      <div className="w-full space-y-0.5">
        {chats.map((chat) => {
          return (
            <SidebarMainChatHistoryItem
              key={chat.id}
              chatId={chat.id}
              title={chat.title}
            />
          )
        })}
      </div>
    </div>
  )
}
