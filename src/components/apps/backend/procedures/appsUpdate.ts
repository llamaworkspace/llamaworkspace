import { appUpdateService } from '@/server/apps/services/appUpdate.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zUpdateInput = z.object({
  id: z.string(),
  title: z.optional(z.nullable(z.string())),
  emoji: z.optional(z.nullable(z.string())),
})

export const appsUpdate = protectedProcedure
  .input(zUpdateInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { id } = input
    const app = await ctx.prisma.app.findFirstOrThrow({
      where: {
        id,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      app.workspaceId,
      userId,
    )
    return await appUpdateService(ctx.prisma, context, {
      appId: id,
      ...input,
    })
  })
