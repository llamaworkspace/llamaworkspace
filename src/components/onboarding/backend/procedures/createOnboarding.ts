import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { updateChatService } from '@/server/chats/services/updateChat.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  id: z.string(),
  title: z.string(),
})

export const createOnboarding = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { id } = input

    const chat = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        id,
      },
      include: {
        app: {
          select: {
            workspaceId: true,
          },
        },
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      chat.app.workspaceId,
      userId,
    )
    return await updateChatService(ctx.prisma, context, input)
  })
