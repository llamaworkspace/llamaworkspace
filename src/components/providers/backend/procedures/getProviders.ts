import { workspaceEditionFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { aiRegistry } from '@/server/ai/aiRegistry'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

export const getProviders = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const workspace = await ctx.prisma.workspace.findFirst({
      where: {
        id: input.workspaceId,
        ...workspaceEditionFilter(userId),
      },
    })

    if (!workspace) {
      return null
    }

    return aiRegistry.getProvidersMeta()
  })
