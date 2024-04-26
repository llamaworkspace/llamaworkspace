import type { RouterOutputs } from '@/lib/api'
import { useNavigation } from '@/lib/frontend/useNavigation'
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
  const navigation = useNavigation()
  const isIndividualChatPage = navigation.pathname === '/c/[chat_id]'

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
              isActive={
                isIndividualChatPage && navigation.query.chat_id === chat.id
              }
            />
          )
        })}
      </div>
    </div>
  )
}
