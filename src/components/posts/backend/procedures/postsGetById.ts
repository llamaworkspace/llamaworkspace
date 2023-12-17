import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import { postVisibilityFilter } from '../postsBackendUtils'

const zByIdInput = z.object({
  id: z.string(),
})

export const postsGetById = protectedProcedure
  .input(zByIdInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    return await ctx.prisma.post.findFirstOrThrow({
      where: {
        id: input.id,
        ...postVisibilityFilter(userId),
      },
      include: {
        chats: {
          select: { id: true, createdAt: true },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  })
