import { protectedProcedure } from '@/server/trpc/trpc'
import {
  workspaceVisibilityFilter,
  zodWorkspaceOutput,
} from '../workspacesBackendUtils'

export const workspacesGetWorkspaces = protectedProcedure
  .output(zodWorkspaceOutput.array())
  .query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return await ctx.prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        ...workspaceVisibilityFilter(userId),
      },
    })
  })
