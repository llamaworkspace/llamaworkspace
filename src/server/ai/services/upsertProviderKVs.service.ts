import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import type { AiProvider } from '@prisma/client'
import { Promise } from 'bluebird'
import { isNull } from 'underscore'

interface ModelParams {
  slug: string
  enabled: boolean
}

export const upsertAiProviderService = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  slug: string,
  keyValues?: Record<string, string | null>,
  modelParams: ModelParams[] = [],
) => {
  await prismaAsTrx(prisma, async (prisma) => {
    const aiProvider = await upsertProviderRaw(prisma, workspaceId, slug)
    await upsertProviderKeyValues(prisma, aiProvider, keyValues)
    await upsertModels(prisma, aiProvider, modelParams)
  })
}

const upsertProviderRaw = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  slug: string,
) => {
  const provider = aiProvidersFetcherService.getProvider(slug)

  if (!provider) {
    throw new Error(`Provider not found: ${slug}`)
  }

  let aiProvider = await prisma.aiProvider.findFirst({
    where: {
      workspaceId,
      slug,
    },
  })

  if (!aiProvider) {
    aiProvider = await prisma.aiProvider.create({
      data: {
        workspaceId,
        slug,
        name: provider.publicName,
      },
    })
  }

  return aiProvider
}

const upsertProviderKeyValues = async (
  prisma: PrismaTrxClient,
  aiProvider: AiProvider,
  keyValues?: Record<string, string | null>,
) => {
  await Promise.map(Object.entries(keyValues ?? {}), async ([key, value]) => {
    const existingKV = await prisma.aiProviderKeyValue.findFirst({
      where: {
        aiProviderId: aiProvider.id,
        key,
      },
    })

    if (isNull(value)) {
      if (existingKV) {
        await prisma.aiProviderKeyValue.delete({
          where: {
            id: existingKV.id,
          },
        })
      }
      return
    }

    if (existingKV) {
      await prisma.aiProviderKeyValue.update({
        where: {
          id: existingKV.id,
        },
        data: {
          value: value.trim(),
        },
      })
    } else {
      await prisma.aiProviderKeyValue.create({
        data: {
          aiProviderId: aiProvider.id,
          key,
          value,
        },
      })
    }
  })
}
const upsertModels = async (
  prisma: PrismaTrxClient,
  aiProvider: AiProvider,
  modelParamsColl: ModelParams[],
) => {
  await Promise.map(modelParamsColl, async (modelParams) => {
    const existingModel = await prisma.aiProviderModel.findFirst({
      where: {
        aiProviderId: aiProvider.id,
        slug: modelParams.slug,
      },
    })

    if (existingModel) {
      await prisma.aiProviderModel.update({
        where: {
          id: existingModel.id,
        },
        data: {
          isEnabled: modelParams.enabled,
        },
      })
    } else {
      await prisma.aiProviderModel.create({
        data: {
          aiProviderId: aiProvider.id,
          slug: modelParams.slug,
          isEnabled: modelParams.enabled,
        },
      })
    }
  })
}
