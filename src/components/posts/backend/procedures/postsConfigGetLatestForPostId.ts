import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getLatestPostConfigForPostIdService } from '@/server/posts/services/getLatestPostConfigForPostId.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zGetLatestByPostId = z.object({
  postId: z.string(),
})

export const postsConfigGetLatestForPostId = protectedProcedure
  .input(zGetLatestByPostId)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const post = await ctx.prisma.post.findFirstOrThrow({
      where: {
        id: input.postId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      post.workspaceId,
      userId,
    )

    return await getLatestPostConfigForPostIdService(ctx.prisma, context, {
      postId: input.postId,
    })
  })
