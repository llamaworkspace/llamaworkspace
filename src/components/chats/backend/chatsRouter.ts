import { createTRPCRouter } from '@/server/trpc/trpc'
import { getMessagesByChatId } from './procedures/getMessagesByChatId'
import { createMessage } from './procedures/createMessage'
import { getChatById } from './procedures/getChatById'
import { getPostConfigForChatId } from './procedures/getPostConfigForChatId'
import { createChat } from './procedures/createChat'
import { createStandaloneChat } from './procedures/createStandaloneChat'
import { deleteChat } from './procedures/deleteChat'
import { updatePostConfigForStandaloneChat } from './procedures/updatePostConfigForStandaloneChat'

export const chatsRouter = createTRPCRouter({
  getChatById,
  getMessagesByChatId,
  createMessage,
  getPostConfigForChatId,
  createChat,
  createStandaloneChat,
  deleteChat,
  updatePostConfigForStandaloneChat,
})
