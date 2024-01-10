import { aiProvidersFetcher } from '@/server/ai/services/aiProvidersFetcher.service'
import { AiRegistryModel } from '@/server/lib/ai-registry/aiRegistryTypes'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import type { AiModel } from '@prisma/client'
import { Promise } from 'bluebird'
import { isNull } from 'underscore'
import { upsertAiProvider } from './upsertProvider.service'

interface ModelParams {
  slug: string
  enabled: boolean
}

export const upsertAiModel = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  providerSlug: string,
  modelSlug: string,
  keyValues?: Record<string, string | null>,
) => {
  await prismaAsTrx(prisma, async (prisma) => {
    const registryProvider = aiProvidersFetcher.getProvider(providerSlug)

    if (!registryProvider) {
      throw new Error(`Provider not found: ${providerSlug}`)
    }

    const provider = await upsertAiProvider(prisma, workspaceId, providerSlug)

    const registryModel = registryProvider.models.find(
      (model) => model.slug === modelSlug,
    )

    if (!registryModel) {
      throw new Error(
        `Model not found: ${modelSlug} for provider ${registryProvider.slug}`,
      )
    }

    const aiModel = await upsertModelRaw(
      prisma,
      workspaceId,
      provider.id,
      registryModel,
    )
    await upsertModelKeyValues(prisma, registryModel, aiModel, keyValues)
  })
}

const upsertModelRaw = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  providerId: string,
  registryModel: AiRegistryModel,
) => {
  let aiModel = await prisma.aiModel.findFirst({
    where: {
      slug: registryModel.slug,
      aiProvider: {
        id: providerId,
        workspaceId,
      },
    },
  })

  if (!aiModel) {
    aiModel = await prisma.aiModel.create({
      data: {
        aiProviderId: providerId,
        slug: registryModel.slug,
      },
    })
  }
  return aiModel
}

const upsertModelKeyValues = async (
  prisma: PrismaTrxClient,
  registryModel: AiRegistryModel,
  aiModel: AiModel,
  keyValues?: Record<string, string | null>,
) => {
  await Promise.map(Object.entries(keyValues ?? {}), async ([key, value]) => {
    const field = registryModel.fields.find((field) => field.slug === key)
    if (!field) {
      throw new Error(`Field not found: ${key}`)
    }

    const existingKV = await prisma.aiModelKeyValue.findFirst({
      where: {
        aiModelId: aiModel.id,
        key,
      },
    })

    if (isNull(value)) {
      if (existingKV) {
        await prisma.aiModelKeyValue.delete({
          where: {
            id: existingKV.id,
          },
        })
      }
      return
    }

    if (existingKV) {
      await prisma.aiModelKeyValue.update({
        where: {
          id: existingKV.id,
        },
        data: {
          value: value.trim(),
        },
      })
    } else {
      await prisma.aiModelKeyValue.create({
        data: {
          aiModelId: aiModel.id,
          key,
          value,
          type: field?.type,
        },
      })
    }
  })
}
