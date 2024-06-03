import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { performAppShareService } from '@/server/shares/services/performAppShare.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  appId: z.string(),
  email: z.string().email(),
})

export const performAppShare = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const invitingUserId = ctx.session.user.id
    const app = await ctx.prisma.app.findUniqueOrThrow({
      where: {
        id: input.appId,
      },
    })
    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      app.workspaceId,
      invitingUserId,
    )
    return await performAppShareService(ctx.prisma, context, {
      email: input.email,
      appId: input.appId,
    })
  })
