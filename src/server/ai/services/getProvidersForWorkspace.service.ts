import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'

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
