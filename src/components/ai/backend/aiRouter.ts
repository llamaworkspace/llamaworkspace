import { createTRPCRouter } from '@/server/trpc/trpc'
import { getAiProviders } from './procedures/getAiProviders'
import { getAvailableAiModels } from './procedures/getAvailableAiModels'
import { getWIPEnabledAiModels } from './procedures/getWIPEnabledAiModels'
import { updateAiProvider } from './procedures/updateAiProvider'

export const aiRouter = createTRPCRouter({
  getAiProviders,
  updateAiProvider,
  getAvailableAiModels,
  getWIPEnabledAiModels,
})
