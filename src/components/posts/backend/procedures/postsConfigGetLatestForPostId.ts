import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getLatestAppConfigForPostIdService } from '@/server/posts/services/getLatestAppConfigForPostId.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zGetLatestByPostId = z.object({
  postId: z.string(),
})

export const postsConfigGetLatestForPostId = protectedProcedure
  .input(zGetLatestByPostId)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const app = await ctx.prisma.app.findFirstOrThrow({
      where: {
        id: input.postId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      app.workspaceId,
      userId,
    )

    return await getLatestAppConfigForPostIdService(ctx.prisma, context, {
      postId: input.postId,
    })
  })
