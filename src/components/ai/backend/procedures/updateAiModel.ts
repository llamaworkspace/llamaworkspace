import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { upsertAiModel } from '@/server/ai/services/upsertAiModel.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
  providerSlug: z.string(),
  modelSlug: z.string(),
  keyValues: z.record(z.string().nullable()).optional(),
})

export const updateAiModel = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { keyValues, workspaceId, providerSlug, modelSlug } = input

    const userId = ctx.session.user.id

    await ctx.prisma.workspace.findFirstOrThrow({
      where: {
        id: workspaceId,
        ...workspaceVisibilityFilter(userId),
      },
    })

    return await upsertAiModel(
      ctx.prisma,
      workspaceId,
      providerSlug,
      modelSlug,
      keyValues,
    )
  })
