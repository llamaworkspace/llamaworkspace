import { createTRPCRouter } from '@/server/trpc/trpc'
import { createChat } from './procedures/createChat'
import { createMessage } from './procedures/createMessage'
import { createStandaloneChat } from './procedures/createStandaloneChat'
import { deleteChat } from './procedures/deleteChat'
import { getChatById } from './procedures/getChatById'
import { getMessagesByChatId } from './procedures/getMessagesByChatId'
import { getPostConfigForChatId } from './procedures/getPostConfigForChatId'
import { updateChatTitle } from './procedures/updateChatTitle'
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
  updateChatTitle,
})
