import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { AiProviderKeyValue } from '@prisma/client'

export const getAiProvidersKVs = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
  providerSlugs?: string[],
) => {
  const result = await prismaAsTrx(prisma, async (prisma) => {
    return await prisma.aiProviderKeyValue.findMany({
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
    })
  })

  return aiProvidersDbPayloadToKeyValues(result)
}

const aiProvidersDbPayloadToKeyValues = (aiProviders: AiProviderKeyValue[]) => {
  const providers: Record<string, Record<string, string>> = {}

  aiProviders.forEach((aiProvider) => {
    if (!providers[aiProvider.slug]) {
      providers[aiProvider.slug] = {}
    }

    providers[aiProvider.slug]![aiProvider.key] = aiProvider.value
  })
  return providers
}
