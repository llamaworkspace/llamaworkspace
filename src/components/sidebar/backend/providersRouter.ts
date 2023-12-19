import { createTRPCRouter } from '@/server/trpc/trpc'
import { getProviders } from './procedures/getProviders'

export const providersRouter = createTRPCRouter({
  getProviders,
})
