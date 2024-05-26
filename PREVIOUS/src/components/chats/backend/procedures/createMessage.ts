import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { createMessageService } from '@/server/chats/services/createMessage.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { Author } from '@/shared/aiTypesAndMappers'
import { z } from 'zod'

const zInput = z.object({
  chatId: z.string(),
  message: z.optional(z.string()),
  author: z.nativeEnum(Author),
})
export const createMessage = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { chatId } = input

    const userId = ctx.session.user.id

    const chat = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        id: chatId,
        authorId: userId,
      },
      include: {
        post: true,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      chat.post.workspaceId,
      userId,
    )

    return await createMessageService(ctx.prisma, context, input)
  })
