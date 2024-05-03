import { useChatHistoryForSidebar } from '@/components/sidebar/sidebarHooks'
import { SidebarMainChatHistoryTimeBlock } from './SidebarMainChatHistoryTimeBlock'

export const SidebarMainChatHistory = () => {
  const { data: sortedChats } = useChatHistoryForSidebar()

  return (
    <div className="space-y-6">
      {sortedChats?.map(({ label, chats }) => {
        return (
          <SidebarMainChatHistoryTimeBlock
            key={label}
            title={label}
            chats={chats}
          />
        )
      })}
    </div>
  )
}
