import { getLatestAppConfigForPostIdService } from '@/server/apps/services/getLatestAppConfigForPostId.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zGetLatestByPostId = z.object({
  appId: z.string(),
})

export const postsConfigGetLatestForPostId = protectedProcedure
  .input(zGetLatestByPostId)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const app = await ctx.prisma.app.findFirstOrThrow({
      where: {
        id: input.appId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      app.workspaceId,
      userId,
    )

    return await getLatestAppConfigForPostIdService(ctx.prisma, context, {
      appId: input.appId,
    })
  })
