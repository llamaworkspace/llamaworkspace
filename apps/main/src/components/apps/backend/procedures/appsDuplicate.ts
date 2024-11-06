import { appDuplicateService } from '@/server/apps/services/appDuplicate.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zCreateInput = z.object({
  appId: z.string(),
})

export const appsDuplicate = protectedProcedure
  .input(zCreateInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const app = await ctx.prisma.app.findUniqueOrThrow({
      where: {
        id: input.appId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      app.workspaceId,
      userId,
    )

    return await appDuplicateService(ctx.prisma, context, {
      appId: input.appId,
    })
  })
