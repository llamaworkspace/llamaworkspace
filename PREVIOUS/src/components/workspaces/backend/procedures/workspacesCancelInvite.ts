import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  inviteId: z.string(),
})

export const workspacesCancelInvite = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const invite = await ctx.prisma.workspaceInvite.findUniqueOrThrow({
      select: {
        workspaceId: true,
      },
      where: {
        id: input.inviteId,
      },
    })

    // Check that the user has access to the WS
    await ctx.prisma.usersOnWorkspaces.findFirstOrThrow({
      where: {
        workspaceId: invite.workspaceId,
        userId: userId,
      },
    })

    await ctx.prisma.workspaceInvite.delete({
      where: {
        id: input.inviteId,
      },
    })
  })
