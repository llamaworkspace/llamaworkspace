import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import { getLatestPostConfigForPostId } from '@/server/posts/services/getLatestPostConfigForPostId.service'

const zGetLatestByPostId = z.object({
  postId: z.string(),
  options: z.optional(
    z.object({
      hideEmptyMessages: z.optional(z.boolean()),
    }),
  ),
})

export const postsConfigGetLatestForPostId = protectedProcedure
  .input(zGetLatestByPostId)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    return await getLatestPostConfigForPostId(ctx.prisma, userId, input.postId)
  })
