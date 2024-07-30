import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { upsertAiProviderService } from '@/server/ai/services/upsertProviderKVs.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
  providerSlug: z.string(),
  keyValues: z.record(z.string().nullable()).optional(),
  models: z
    .array(z.object({ slug: z.string(), enabled: z.boolean() }))
    .optional(),
})

export const updateAiProvider = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { keyValues, workspaceId, providerSlug, models } = input

    const userId = ctx.session.user.id

    await ctx.prisma.workspace.findFirstOrThrow({
      where: {
        id: workspaceId,
        ...workspaceVisibilityFilter(userId),
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      workspaceId,
      userId,
    )

    await context.isAdminOrThrow()

    return await upsertAiProviderService(
      ctx.prisma,
      workspaceId,
      providerSlug,
      keyValues,
      models,
    )
  })
