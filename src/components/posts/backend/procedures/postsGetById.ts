import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getPostByIdService } from '@/server/posts/services/getPostById.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zByIdInput = z.object({
  id: z.string(),
})

export const postsGetById = protectedProcedure
  .input(zByIdInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const postId = input.id

    const post = await ctx.prisma.post.findFirstOrThrow({
      where: {
        id: postId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      post.workspaceId,
      userId,
    )

    return getPostByIdService(ctx.prisma, context, { postId })
  })
