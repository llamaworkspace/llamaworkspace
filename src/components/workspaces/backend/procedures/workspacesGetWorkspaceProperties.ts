import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import { workspaceVisibilityFilter } from '../workspacesBackendUtils'

const zInput = z.object({
  workspaceId: z.string(),
})

export const workspacesGetWorkspaceProperties = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { workspaceId } = input

    const workspace = await ctx.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
        ...workspaceVisibilityFilter(userId),
      },
    })

    const aiProviders = await aiProvidersFetcherService.getFullAiProvidersMeta(
      workspaceId,
      userId,
    )

    const huggingFaceProvider = aiProviders.find(
      (provider) => provider.slug.toLowerCase() === 'huggingface',
    )

    return {
      id: workspace?.id,
      name: workspace?.name,
      hasHuggingFaceApiKey: !huggingFaceProvider?.hasMissingFields,
    }
  })
