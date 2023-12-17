import { chatVisibilityFilter } from '@/components/chats/backend/chatsBackendUtils'
import { getLatestPostConfigForPostId } from '@/server/posts/services/getLatestPostConfigForPostId.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zGetById = z.object({
  chatId: z.string(),
})

export const postsConfigGetForChatId = protectedProcedure
  .input(zGetById)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const chat = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        id: input.chatId,
        ...chatVisibilityFilter(userId),
      },
    })

    if (chat.postConfigVersionId) {
      return await ctx.prisma.postConfigVersion.findFirstOrThrow({
        where: {
          id: chat.postConfigVersionId,
        },
        include: {
          messages: {
            where: {
              AND: [
                {
                  message: { not: '' },
                },
                {
                  message: { not: null },
                },
              ],
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })
    } else {
      return await getLatestPostConfigForPostId(ctx.prisma, userId, chat.postId)
    }
  })
