import { createDefaultPostService } from '@/server/posts/services/createDefaultPost.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

export const postsGetDefault = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const defaultPost = await ctx.prisma.post.findFirst({
      select: { id: true },
      where: {
        userId,
        workspaceId: input.workspaceId,
        isDefault: true,
      },
    })
    if (!defaultPost) {
      // This scenario should never happen, but this is just
      // defensive code to generate a default post as a last resort
      return await createDefaultPostService(
        ctx.prisma,
        input.workspaceId,
        userId,
      )
    }
    return defaultPost
  })
