import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { appConfigVersionUpdateForDefaultPostService } from '@/server/posts/services/appConfigVersionUpdateForDefaultPost.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  chatId: z.string(),
  model: z.string(),
})

export const updateAppConfigForStandaloneChat = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { chatId } = input

    const userId = ctx.session.user.id
    const chat = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        id: chatId,
      },
      include: {
        app: true,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      chat.app.workspaceId,
      userId,
    )

    return await appConfigVersionUpdateForDefaultPostService(
      ctx.prisma,
      context,
      input,
    )
  })
