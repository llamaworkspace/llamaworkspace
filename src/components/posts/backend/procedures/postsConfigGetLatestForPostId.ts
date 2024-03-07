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

    return await getLatestPostConfigForPostIdService(
      ctx.prisma,
      userId,
      input.postId,
    )
  })
