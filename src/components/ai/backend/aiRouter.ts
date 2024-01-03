import { createTRPCRouter } from '@/server/trpc/trpc'
import { getAiModelsMetaForProvider } from './procedures/getAiModelsMetaForProvider'
import { getWIPEnabledAiModels } from './procedures/getWIPEnabledAiModels'
import { getWIPNextAiProvidersMaster } from './procedures/getWIPNextAiProvidersMaster'
import { updateAiProvider } from './procedures/updateAiProvider'

export const aiRouter = createTRPCRouter({
  getWIPNextAiProvidersMaster,
  updateAiProvider,
  getAiModelsMetaForProvider,
  getWIPEnabledAiModels,
})
