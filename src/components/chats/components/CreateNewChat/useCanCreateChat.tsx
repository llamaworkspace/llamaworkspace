import { useMessages } from '../../chatHooks'

export const useCanCreateChat = (postId?: string, chatId?: string) => {
  const { data: messages } = useMessages(chatId)
  return postId && chatId && messages && messages.length > 0
}
