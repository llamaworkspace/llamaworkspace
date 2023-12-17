import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import { postVisibilityFilter } from '../postsBackendUtils'

const zInput = z.object({
  workspaceId: z.string(),
})

export const postsGetLatest = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const post = await ctx.prisma.post.findFirst({
      where: {
        isDefault: false,
        workspaceId: input.workspaceId,
        ...postVisibilityFilter(userId),
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!post) {
      return null
    }

    const lastChat = await ctx.prisma.chat.findFirst({
      where: {
        postId: post.id,
        authorId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { ...post, lastChatId: lastChat?.id }
  })
