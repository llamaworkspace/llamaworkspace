import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { performPostShareService } from '@/server/shares/services/performPostShare.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  postId: z.string(),
  email: z.string().email(),
})

export const performPostShare = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const invitingUserId = ctx.session.user.id
    const app = await ctx.prisma.app.findUniqueOrThrow({
      where: {
        id: input.postId,
      },
    })
    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      post.workspaceId,
      invitingUserId,
    )
    return await performPostShareService(ctx.prisma, context, {
      email: input.email,
      postId: input.postId,
    })
  })
