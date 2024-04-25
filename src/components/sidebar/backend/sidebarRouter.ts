import { createTRPCRouter } from '@/server/trpc/trpc'
import { getChatHistoryForSidebarV2 } from './procedures/getChatHistoryForSidebarV2'
import { getInfoCardForSidebar } from './procedures/getInfoCardForSidebar'
import { getPostsForSidebarV2 } from './procedures/getPostsForSidebarV2'

export const sidebarRouter = createTRPCRouter({
  postsForSidebarV2: getPostsForSidebarV2,
  chatHistoryForSidebarV2: getChatHistoryForSidebarV2,
  infoCardForSidebar: getInfoCardForSidebar,
})
