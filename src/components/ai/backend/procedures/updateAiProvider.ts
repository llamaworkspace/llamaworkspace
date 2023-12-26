import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { upsertAiProvider } from '@/server/ai/services/upsertProviderKVs.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
  openAiApiKey: z.string().optional().nullable(),
})

export const updateAiProvider = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { openAiApiKey, workspaceId } = input

    const userId = ctx.session.user.id

    await ctx.prisma.workspace.findFirstOrThrow({
      where: {
        id: workspaceId,
        ...workspaceVisibilityFilter(userId),
      },
    })

    return await upsertAiProvider(
      ctx.prisma,
      workspaceId,
      'openai',
      undefined,
      {
        apiKey: openAiApiKey ?? null,
      },
    )
  })
