import { protectedProcedure } from '@/server/trpc/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { workspaceEditionFilter } from '../workspacesBackendUtils'

const zInput = z.object({
  workspaceId: z.string(),
  userId: z.string(),
})

export const workspacesRevokeWorkspaceMemberAccess = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const workspaceOwner = await ctx.prisma.usersOnWorkspaces.findFirstOrThrow({
      select: {
        userId: true,
      },
      where: {
        workspaceId: input.workspaceId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    if (workspaceOwner.userId === input.userId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'The workspace owner access cannot be revoked',
      })
    }

    await ctx.prisma.usersOnWorkspaces.delete({
      where: {
        userId_workspaceId: {
          userId: input.userId,
          workspaceId: input.workspaceId,
        },
        workspace: {
          ...workspaceEditionFilter(userId),
        },
      },
    })
  })
