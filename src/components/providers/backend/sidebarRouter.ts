import { createTRPCRouter } from '@/server/trpc/trpc'
import { getChatHistoryForSidebar } from './procedures/getChatHistoryForSidebar'
import { getInfoCardForSidebar } from './procedures/getInfoCardForSidebar'
import { getPostsForSidebar } from './procedures/getPostsForSidebar'
import { updatePostSortingForSidebar } from './procedures/updatePostSortingForSidebar'

export const sidebarRouter = createTRPCRouter({
  postsForSidebar: getPostsForSidebar,
  updatePostSortingForSidebar,
  chatHistoryForSidebar: getChatHistoryForSidebar,
  infoCardForSidebar: getInfoCardForSidebar,
})
