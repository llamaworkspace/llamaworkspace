import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { postDeleteService } from '@/server/posts/services/postDelete.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  id: z.string(),
})

export const postsDelete = protectedProcedure
  .input(zInput)
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

    return await postDeleteService(ctx.prisma, context, { postId: id })
  })
