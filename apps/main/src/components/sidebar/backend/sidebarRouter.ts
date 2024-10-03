import { createTRPCRouter } from '@/server/trpc/trpc'
import { getAppsForSidebar } from './procedures/getAppsForSidebar'
import { getChatHistoryForSidebar } from './procedures/getChatHistoryForSidebar'
import { deprecated_getInfoCardForSidebar } from './procedures/getInfoCardForSidebar'

export const sidebarRouter = createTRPCRouter({
  appsForSidebar: getAppsForSidebar,
  chatHistoryForSidebar: getChatHistoryForSidebar,
  infoCardForSidebar: deprecated_getInfoCardForSidebar,
})
