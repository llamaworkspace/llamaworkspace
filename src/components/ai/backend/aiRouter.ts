import { createTRPCRouter } from '@/server/trpc/trpc'
import { getAiProviders } from './procedures/getAiProviders'
import { getAiProvidersV2 } from './procedures/getAiProvidersV2'
import { updateAiProvider } from './procedures/updateAiProvider'

export const aiRouter = createTRPCRouter({
  getAiProviders,
  getAiProvidersV2,
  updateAiProvider,
})
