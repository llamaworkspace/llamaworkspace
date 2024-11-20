import type { RouterOutputs } from '@/lib/api'
import { useParams } from 'next/navigation'
import { SidebarMainChatHistoryItem } from './SidebarMainChatHistoryItem'

type ChatHistoryForSidebarOutput =
  RouterOutputs['sidebar']['chatHistoryForSidebar']

interface ChatHistoryTimeBlockProps {
  title: string
  chats: ChatHistoryForSidebarOutput
}

export const SidebarMainChatHistoryTimeBlock = ({
  title,
  chats,
}: ChatHistoryTimeBlockProps) => {
  const params = useParams<{ chat_id: string }>()
  const isIndividualChatPage = params?.chat_id !== null

  return (
    <div className="w-full space-y-1">
      <div className="px-2 text-xs font-bold uppercase text-zinc-400">
        {title}
      </div>
      <div className="w-full space-y-0.5">
        {chats.map((chat) => {
          return (
            // Keep this div here for the space-y to be respected
            <div key={chat.id}>
              <SidebarMainChatHistoryItem
                chatId={chat.id}
                title={chat.title}
                isActive={isIndividualChatPage && params?.chat_id === chat.id}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
