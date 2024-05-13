import { createTRPCRouter } from '@/server/trpc/trpc'
import { getChatHistoryForSidebar } from './procedures/getChatHistoryForSidebar'
import { deprecated_getInfoCardForSidebar } from './procedures/getInfoCardForSidebar'
import { getPostsForSidebar } from './procedures/getPostsForSidebar'

export const sidebarRouter = createTRPCRouter({
  postsForSidebar: getPostsForSidebar,
  chatHistoryForSidebar: getChatHistoryForSidebar,
  infoCardForSidebar: deprecated_getInfoCardForSidebar,
})
