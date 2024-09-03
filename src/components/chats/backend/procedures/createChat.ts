import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { createChatService } from '@/server/chats/services/createChat.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  appId: z.string(),
})

export const createChat = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { appId } = input

    const userId = ctx.session.user.id

    const app = await ctx.prisma.app.findFirstOrThrow({
      where: {
        id: appId,
        markAsDeletedAt: null,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      app.workspaceId,
      userId,
    )

    return await createChatService(ctx.prisma, context, input)
  })
