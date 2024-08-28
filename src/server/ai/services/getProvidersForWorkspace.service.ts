import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'

export const getAllAiProvidersKVsService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  providerSlugs?: string[],
) => {
  const result = await prismaAsTrx(prisma, async (prisma) => {
    return getAiProvidersIncludingKeyValues(prisma, uowContext, providerSlugs)
  })

  return aiProvidersDbPayloadToKeyValues(result)
}

export const getAiProviderKVsService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  providerSlug: string,
) => {
  const result = await getAllAiProvidersKVsService(prisma, uowContext, [
    providerSlug,
  ])
  if (!result[providerSlug]) {
    return {}
  }
  return result[providerSlug] ?? {}
}

const getAiProvidersIncludingKeyValues = async (
  prisma: PrismaTrxClient,
  uowContext: UserOnWorkspaceContext,
  providerSlugs?: string[],
) => {
  const { workspaceId, userId } = uowContext

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
