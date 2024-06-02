import { createTRPCRouter } from '@/server/trpc/trpc'
import { getCanPerformActionForAppId } from './procedures/getCanPerformActionForAppId'

export const permissionsRouter = createTRPCRouter({
  canPerformActionForAppId: getCanPerformActionForAppId,
})
