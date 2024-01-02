import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { aiRegistry } from '@/server/ai/aiRegistry'
import { getAiProvidersWithKVs } from '@/server/ai/services/getProvidersForWorkspace.service'
import type { AiRegistryModel } from '@/server/lib/ai-registry/aiRegistryTypes'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

type AiRegistryModelWithFullNamePaths = AiRegistryModel & {
  providerSlug: string
  fullSlug: string
  fullPublicName: string
}

export const getEnabledAiModels = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    await ctx.prisma.workspace.findUniqueOrThrow({
      where: {
        id: input.workspaceId,
        ...workspaceVisibilityFilter(userId),
      },
    })

    const registry = aiRegistry.getProvidersMeta()
    const registryFinalModels: AiRegistryModelWithFullNamePaths[] = []

    const thing = await getAiProvidersWithKVs(
      ctx.prisma,
      input.workspaceId,
      userId,
    )

    registry.map((provider) => {
      const item = thing.find((item) => item.slug === provider.slug)
      if (item?.missingFields && item.missingFields.length > 0) {
        return
      }
      provider.models.map((model) => {
        registryFinalModels.push({
          ...model,
          providerSlug: provider.slug,
          fullSlug: `${provider.slug}/${model.slug}`,
          fullPublicName: `${provider.publicName} > ${model.publicName}`,
        })
      })
    })

    return registryFinalModels
  })
