import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getMessagesByChatIdService } from '@/server/chats/services/getMessagesByChatId.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  chatId: z.string(),
})

export const getMessagesByChatId = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { chatId } = input
    const chat = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        id: chatId,
      },
      include: {
        post: {
          select: {
            workspaceId: true,
          },
        },
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      chat.post.workspaceId,
      userId,
    )

    return getMessagesByChatIdService(ctx.prisma, context, input)
  })
