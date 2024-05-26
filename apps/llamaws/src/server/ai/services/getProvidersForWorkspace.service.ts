import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { env } from '@/env.mjs'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'

export const getAiProvidersKVsService = async (
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

export const getAiProviderKVsWithFallbackToInternalKeysService = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
  providerSlug: string,
) => {
  const providerKVs = await getAiProviderKVsService(
    prisma,
    workspaceId,
    userId,
    providerSlug,
  )

  if (!providerKVs.apiKey && providerSlug === 'openai') {
    const res: Record<string, string> = {
      apiKey: env.INTERNAL_OPENAI_API_KEY,
    }
    if (env.OPTIONAL_OPENAI_BASE_URL) {
      res.baseUrl = env.OPTIONAL_OPENAI_BASE_URL
    }
    return res
  }

  return providerKVs
}

export const getAiProviderKVsService = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
  providerSlug: string,
) => {
  const result = await getAiProvidersKVsService(prisma, workspaceId, userId, [
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
