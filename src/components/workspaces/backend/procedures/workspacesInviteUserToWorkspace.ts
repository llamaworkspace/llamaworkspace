import { protectedProcedure } from '@/server/trpc/trpc'
import { inviteToWorkspaceService } from '@/server/workspaces/services/inviteToWorkspace.service'
import { z } from 'zod'
import { workspaceEditionFilter } from '../workspacesBackendUtils'

const zInput = z.object({
  workspaceId: z.string(),
  email: z.string(),
})

export const workspacesInviteUserToWorkspace = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const invitingUserId = ctx.session.user.id

    // has this user access to this workspace?
    await ctx.prisma.workspace.findUniqueOrThrow({
      select: {
        id: true,
      },
      where: {
        id: input.workspaceId,
        ...workspaceEditionFilter(invitingUserId),
      },
    })

    await inviteToWorkspaceService(
      ctx.prisma,
      input.workspaceId,
      invitingUserId,
      input.email,
    )
  })
