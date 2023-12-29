import { createTRPCRouter } from '@/server/trpc/trpc'
import { getAiModels } from './procedures/getAiModels'
import { getAiProviders } from './procedures/getAiProviders'
import { updateAiProvider } from './procedures/updateAiProvider'

export const aiRouter = createTRPCRouter({
  getAiProviders,
  updateAiProvider,
  getAiModels,
})
