import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { inviteToWorkspaceService } from '@/server/workspaces/services/inviteToWorkspace.service'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
  email: z.string(),
})

export const workspacesInviteUserToWorkspace = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const invitingUserId = ctx.session.user.id

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      input.workspaceId,
      invitingUserId,
    )

    await inviteToWorkspaceService(ctx.prisma, context, input.email, false)
  })
