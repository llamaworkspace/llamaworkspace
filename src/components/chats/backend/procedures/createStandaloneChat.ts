import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { createStandaloneChatService } from '@/server/chats/services/createStandaloneChat.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  postId: z.string(),
})

export const createStandaloneChat = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { postId } = input

    const userId = ctx.session.user.id

    // await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
    //   PermissionAction.Use,
    //   userId,
    //   postId,
    // )

    const post = await ctx.prisma.post.findUniqueOrThrow({
      where: {
        id: postId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      post.workspaceId,
      userId,
    )

    return await createStandaloneChatService(ctx.prisma, context, {
      postId,
    })
  })
