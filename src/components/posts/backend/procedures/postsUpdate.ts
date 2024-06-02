import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { postUpdateService } from '@/server/posts/services/postUpdate.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zUpdateInput = z.object({
  id: z.string(),
  title: z.optional(z.nullable(z.string())),
  emoji: z.optional(z.nullable(z.string())),
  gptEngine: z.optional(z.string()),
})

export const postsUpdate = protectedProcedure
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
      post.workspaceId,
      userId,
    )
    return await postUpdateService(ctx.prisma, context, {
      postId: id,
      ...input,
    })
  })
