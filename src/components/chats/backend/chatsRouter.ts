import { createTRPCRouter } from '@/server/trpc/trpc'
import { createChat } from './procedures/createChat'
import { createMessage } from './procedures/createMessage'
import { deleteChat } from './procedures/deleteChat'
import { getAppConfigForChatId } from './procedures/getAppConfigForChatId'
import { getChatById } from './procedures/getChatById'
import { getMessagesByChatId } from './procedures/getMessagesByChatId'
import { updateAppConfigForStandaloneChat } from './procedures/updateAppConfigForStandaloneChat'
import { updateChat } from './procedures/updateChat'

export const chatsRouter = createTRPCRouter({
  getChatById,
  getMessagesByChatId,
  createMessage,
  getAppConfigForChatId,
  createChat,
  updateChat,
  deleteChat,
  updateAppConfigForStandaloneChat,
})
