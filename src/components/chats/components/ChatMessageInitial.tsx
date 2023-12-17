import { usePostConfigForChat } from '../chatHooks'
import { ChatMessage } from './ChatMessage'

export const ChatMessageInitial = ({ chatId }: { chatId?: string }) => {
  const { data: postConfig } = usePostConfigForChat(chatId)

  if (!postConfig?.initialMessage) return null

  return (
    <ChatMessage
      variant="wizard"
      message={postConfig.initialMessage}
      author={'Wizard'}
    />
  )
}
