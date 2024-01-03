import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { aiRegistry } from '@/server/ai/aiRegistry'
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

export const getWIPEnabledAiModels = protectedProcedure
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

    registry.map((provider) => {
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
