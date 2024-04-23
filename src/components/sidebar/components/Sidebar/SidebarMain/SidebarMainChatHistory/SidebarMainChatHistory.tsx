import { useChatHistoryForSidebarPostV2 } from '@/components/sidebar/sidebarHooks'
import type { RouterOutputs } from '@/lib/api'
import { SidebarMainChatHistoryTimeBlock } from './SidebarMainChatHistoryTimeBlock'

type ChatHistoryForSidebarOutput =
  RouterOutputs['sidebar']['chatHistoryForSidebarV2']

export const SidebarMainChatHistory = () => {
  const { data: chats } = useChatHistoryForSidebarPostV2()

  return (
    <div className="space-y-8">
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
