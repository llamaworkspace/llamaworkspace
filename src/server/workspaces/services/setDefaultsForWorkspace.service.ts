import { upsertAiProvider } from '@/server/ai/services/upsertProviderKVs.service'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import {
  PrismaTrxClient,
  type PrismaClientOrTrxClient,
} from '@/shared/globalTypes'

const DEFAULT_OPENAI_MODELS = ['gpt-4-turbo-preview', 'gpt-3.5-turbo']

export const setDefaultsForWorkspace = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    await setDefaultEnabledAiModels(prisma, workspaceId)
  })
}

const setDefaultEnabledAiModels = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
) => {
  await upsertAiProvider(
    prisma,
    workspaceId,
    'openai',
    undefined,
    DEFAULT_OPENAI_MODELS.map((slug) => ({
      slug,
      enabled: true,
    })),
  )
}
