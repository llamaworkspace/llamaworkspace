import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { postConfigVersionUpdateForDefaultPostService } from '@/server/posts/services/postConfigVersionUpdateForDefaultPost.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  chatId: z.string(),
  model: z.string(),
})

export const updatePostConfigForStandaloneChat = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { chatId } = input

    const userId = ctx.session.user.id
    const chat = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        id: chatId,
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

    return await postConfigVersionUpdateForDefaultPostService(
      ctx.prisma,
      context,
      input,
    )
  })
