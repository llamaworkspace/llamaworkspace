import { useChatHistoryForSidebarPost } from '@/components/sidebar/sidebarHooks'
import type { RouterOutputs } from '@/lib/api'
import { SidebarMainChatHistoryTimeBlock } from './SidebarMainChatHistoryTimeBlock'

type ChatHistoryForSidebarOutput =
  RouterOutputs['sidebar']['chatHistoryForSidebar']

export const SidebarMainChatHistory = () => {
  const { data: chats } = useChatHistoryForSidebarPost()

  return (
    <div className="space-y-6">
      {chats &&
        Object.entries<ChatHistoryForSidebarOutput>(chats).map(
          ([title, chats]) => {
            return (
              <SidebarMainChatHistoryTimeBlock
                key={title}
                title={title}
                chats={chats}
              />
            )
          },
        )}
    </div>
  )
}
