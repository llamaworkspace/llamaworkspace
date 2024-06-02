import { appConfigVersionUpdateService } from '@/server/apps/services/appConfigVersionUpdate.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zUpdate = z.object({
  id: z.string(),
  description: z.string().optional().nullable(),
  systemMessage: z.string().optional(),
  model: z.string().optional(),
})

export const postsConfigUpdate = protectedProcedure
  .input(zUpdate)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { id } = input

    const appConfigVersion = await ctx.prisma.appConfigVersion.findFirstOrThrow(
      {
        where: {
          id,
        },
        include: { app: true },
      },
    )

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      appConfigVersion.app.workspaceId,
      userId,
    )

    return await appConfigVersionUpdateService(ctx.prisma, context, input)
  })
