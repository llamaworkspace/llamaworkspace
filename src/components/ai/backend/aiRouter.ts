import { createTRPCRouter } from '@/server/trpc/trpc'
import { getAiProviders } from './procedures/getAiProviders'
import { updateAiModel } from './procedures/updateAiModel'
import { updateAiProvider } from './procedures/updateAiProvider'

export const aiRouter = createTRPCRouter({
  getAiProviders,
  updateAiProvider,
  updateAiModel,
})
