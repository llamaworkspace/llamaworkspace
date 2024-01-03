import { createTRPCRouter } from '@/server/trpc/trpc'
import { getAiModelsMetaForProvider } from './procedures/getAiModelsMetaForProvider'
import { getAiProvidersWithDBEntries } from './procedures/getAiProvidersWithDBEntries'
import { getNextAiProvidersMaster } from './procedures/getNextAiProvidersMaster'
import { getWIPEnabledAiModels } from './procedures/getWIPEnabledAiModels'
import { updateAiProvider } from './procedures/updateAiProvider'

export const aiRouter = createTRPCRouter({
  getNextAiProvidersMaster,
  getAiProvidersWithDBEntries,
  updateAiProvider,
  getAiModelsMetaForProvider,
  getWIPEnabledAiModels,
})
