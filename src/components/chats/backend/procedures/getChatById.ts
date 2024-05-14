import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getChatByIdService } from '@/server/chats/services/getChatById.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  chatId: z.string(),
})

export const getChatById = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
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
      userId,
      chat.post.workspaceId,
    )

    return getChatByIdService(ctx.prisma, context, input)
  })
