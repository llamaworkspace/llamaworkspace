import { protectedProcedure } from '@/server/trpc/trpc'
import { createWorkspaceForUserService } from '@/server/users/services/createWorkspaceForUser.service'
import { zodWorkspaceOutput } from '../workspacesBackendUtils'

export const workspacesCreateWorkspace = protectedProcedure
  .output(zodWorkspaceOutput)
  .mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const workspace = await createWorkspaceForUserService(ctx.prisma, userId)

    return {
      id: workspace.id,
      name: workspace.name,
    }
  })
