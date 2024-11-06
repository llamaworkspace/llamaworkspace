import { useChatHistoryForSidebar } from '@/components/sidebar/sidebarHooks'
import { getChatsGroupedByDate } from '@/components/sidebar/utils/sidebarUtils'
import { useMemo } from 'react'
import { SidebarMainChatHistoryTimeBlock } from './SidebarMainChatHistoryTimeBlock'

export const SidebarMainChatHistory = () => {
  const { data: chatHistory } = useChatHistoryForSidebar()

  const sortedChats = useMemo(() => {
    if (!chatHistory) return null
    return getChatsGroupedByDate(chatHistory)
  }, [chatHistory])

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
