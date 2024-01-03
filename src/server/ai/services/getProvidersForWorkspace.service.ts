import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { maskValueWithBullets } from '@/lib/appUtils'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import _ from 'underscore'
import { aiProvidersFetcher } from './aiProvidersFetcher.service'

export const getAiProvidersWithKVs = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
  maskEncryptedValues = false,
  providerSlugs?: string[],
) => {
  const aiProvidersWithKVs = await getAiProvidersIncludingKeyValues(
    prisma,
    workspaceId,
    userId,
    providerSlugs,
  )

  const aiProvidersKVBySlug =
    aiProvidersDbPayloadToKeyValues(aiProvidersWithKVs)

  const providersMeta = aiProvidersFetcher.getProvidersMeta()

  return providersMeta.map((providerMeta) => {
    const providerSlug = providerMeta.slug
    const provider = aiProvidersFetcher.getProvider(providerSlug)
    const providerFields = provider?.fields ?? []

    const fieldSlugs = providerFields.map((field) => field.slug)

    let providerKV = _.chain(aiProvidersKVBySlug[providerSlug]).pick(
      ...fieldSlugs,
    )

    if (maskEncryptedValues) {
      providerKV = providerKV.mapObject((value: string, key) => {
        const field = providerFields.find((field) => field.slug === key)
        if (field?.encrypted) {
          return maskValueWithBullets(value)
        }

        return value
      })
    }

    const resolvedValues = providerKV.value()
    const missingFields = _.difference(
      fieldSlugs,
      Object.keys(resolvedValues ?? {}),
    ).filter((fieldSlug) => {
      const field = providerFields.find((field) => field.slug === fieldSlug)
      return field?.required
    })

    return {
      ...providerMeta,
      values: resolvedValues ?? {},
      missingFields,
    }
  })
}

export const getAiProvidersKVs = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
  providerSlugs?: string[],
) => {
  const result = await prismaAsTrx(prisma, async (prisma) => {
    return getAiProvidersIncludingKeyValues(
      prisma,
      workspaceId,
      userId,
      providerSlugs,
    )
  })

  return aiProvidersDbPayloadToKeyValues(result)
}

export const getAiProviderKVs = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
  providerSlug: string,
) => {
  const result = await getAiProvidersKVs(prisma, workspaceId, userId, [
    providerSlug,
  ])
  if (!result[providerSlug]) {
    return {}
  }
  return result[providerSlug] ?? {}
}

const getAiProvidersIncludingKeyValues = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  userId: string,
  providerSlugs?: string[],
) => {
  return await prisma.aiProvider.findMany({
    where: {
      workspaceId,
      ...(providerSlugs
        ? {
            slug: {
              in: providerSlugs,
            },
          }
        : {}),
      workspace: {
        ...workspaceVisibilityFilter(userId),
      },
    },
    include: {
      keyValues: true,
    },
  })
}

type AiProvidersWithKVs = Awaited<
  ReturnType<typeof getAiProvidersIncludingKeyValues>
>

const aiProvidersDbPayloadToKeyValues = (aiProviders: AiProvidersWithKVs) => {
  const providers: Record<string, Record<string, string>> = {}

  aiProviders.forEach((aiProvider) => {
    if (!providers[aiProvider.slug]) {
      providers[aiProvider.slug] = {}
    }

    aiProvider.keyValues.forEach((keyValue) => {
      providers[aiProvider.slug]![keyValue.key] = keyValue.value
    })
  })

  return providers
}
