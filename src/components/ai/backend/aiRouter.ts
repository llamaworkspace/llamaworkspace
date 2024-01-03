import { createTRPCRouter } from '@/server/trpc/trpc'
import { getWIPEnabledAiModels } from './procedures/getWIPEnabledAiModels'
import { getWIPNextAiProvidersMaster } from './procedures/getWIPNextAiProvidersMaster'
import { updateAiProvider } from './procedures/updateAiProvider'

export const aiRouter = createTRPCRouter({
  getWIPNextAiProvidersMaster,
  updateAiProvider,
  getWIPEnabledAiModels,
})
