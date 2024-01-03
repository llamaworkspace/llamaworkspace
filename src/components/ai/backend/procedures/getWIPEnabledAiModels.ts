import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { aiProvidersFetcher } from '@/server/ai/services/aiProvidersFetcher.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

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

    const providers = await aiProvidersFetcher.getFullAiProvidersMeta(
      input.workspaceId,
      userId,
    )

    return providers.flatMap((provider) => provider.models)
  })
