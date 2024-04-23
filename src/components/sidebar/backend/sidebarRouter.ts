import { createTRPCRouter } from '@/server/trpc/trpc'
import { getChatHistoryForSidebar } from './procedures/getChatHistoryForSidebar'
import { getChatHistoryForSidebarV2 } from './procedures/getChatHistoryForSidebarV2'
import { getInfoCardForSidebar } from './procedures/getInfoCardForSidebar'
import { getPostsForSidebar } from './procedures/getPostsForSidebar'
import { getPostsForSidebarV2 } from './procedures/getPostsForSidebarV2'
import { updatePostSortingForSidebar } from './procedures/updatePostSortingForSidebar'

export const sidebarRouter = createTRPCRouter({
  postsForSidebarV2: getPostsForSidebarV2,
  postsForSidebar: getPostsForSidebar,
  updatePostSortingForSidebar,
  chatHistoryForSidebarV2: getChatHistoryForSidebarV2,
  chatHistoryForSidebar: getChatHistoryForSidebar,
  infoCardForSidebar: getInfoCardForSidebar,
})
