import { getLatestAppConfigForAppIdService } from '@/server/apps/services/getLatestAppConfigForAppId.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zGetLatestByAppId = z.object({
  appId: z.string(),
})

export const postsConfigGetLatestForAppId = protectedProcedure
  .input(zGetLatestByAppId)
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

    return await getLatestAppConfigForAppIdService(ctx.prisma, context, {
      appId: input.appId,
    })
  })
