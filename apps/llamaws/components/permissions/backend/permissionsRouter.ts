import { createTRPCRouter } from 'server/trpc/trpc'
import { getCanPerformActionForPostId } from './procedures/getCanPerformActionForPostId'

export const permissionsRouter = createTRPCRouter({
  canPerformActionForPostId: getCanPerformActionForPostId,
})
