import { createTRPCRouter } from '@/server/trpc/trpc'
import { getCanPerformActionForAppId } from './procedures/getCanPerformActionForAppId'
import { getCanPerformActionForAppIds } from './procedures/getCanPerformActionForAppIds'

export const permissionsRouter = createTRPCRouter({
  canPerformActionForAppId: getCanPerformActionForAppId,
  canPerformActionForAppIds: getCanPerformActionForAppIds,
})
