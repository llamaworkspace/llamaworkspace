import { upsertAppKeyValuesService } from '@/server/apps/services/upsertAppKeyValues.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zUpdate = z.object({
  id: z.string(),
  keyValuePairs: z.record(
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  ),
})

export const appsKeyValuesUpdate = protectedProcedure
  .input(zUpdate)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { id, keyValuePairs } = input

    const app = await ctx.prisma.app.findFirstOrThrow({
      where: {
        id,
        markAsDeletedAt: null,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      app.workspaceId,
      userId,
    )

    return await upsertAppKeyValuesService(ctx.prisma, context, {
      appId: id,
      keyValuePairs,
    })
  })
