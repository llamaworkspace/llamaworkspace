import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getChatsService } from '@/server/chats/services/getChats.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  postId: z.string(),
  workspaceId: z.string(),
})

export const getChatHistoryForSidebar = protectedProcedure
  .input(zInput)
  .query(async ({ input, ctx }) => {
    const userId = ctx.session.user.id
    const { postId, workspaceId } = input

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      workspaceId,
      userId,
    )

    return await getChatsService(ctx.prisma, context, {
      postId,
    })
  })
