import { createTRPCRouter } from '@/server/trpc/trpc'
import { getAiModelsMetaForProvider } from './procedures/getAiModelsMetaForProvider'
import { getAiProvidersWithDBEntries } from './procedures/getAiProvidersWithDBEntries'
import { getWIPEnabledAiModels } from './procedures/getWIPEnabledAiModels'
import { updateAiProvider } from './procedures/updateAiProvider'

export const aiRouter = createTRPCRouter({
  getAiProvidersWithDBEntries,
  updateAiProvider,
  getAiModelsMetaForProvider,
  getWIPEnabledAiModels,
})
