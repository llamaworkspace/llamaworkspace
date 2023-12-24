import { createTRPCRouter } from '@/server/trpc/trpc'
import { getProviders } from './procedures/getProviders'
import { updateProvider } from './procedures/updateProvider'

export const providersRouter = createTRPCRouter({
  getProviders,
  updateProvider,
})
