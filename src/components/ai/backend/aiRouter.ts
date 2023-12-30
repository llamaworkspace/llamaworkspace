import { createTRPCRouter } from '@/server/trpc/trpc'
import { getAiProviders } from './procedures/getAiProviders'
import { getAvailableAiModels } from './procedures/getAvailableAiModels'
import { getEnabledAiModels } from './procedures/getEnabledAiModels'
import { updateAiProvider } from './procedures/updateAiProvider'

export const aiRouter = createTRPCRouter({
  getAiProviders,
  updateAiProvider,
  getAvailableAiModels,
  getEnabledAiModels,
})
