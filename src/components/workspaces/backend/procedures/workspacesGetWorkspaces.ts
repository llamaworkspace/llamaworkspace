import { protectedProcedure } from '@/server/trpc/trpc'
import {
  workspaceVisibilityFilter,
  zodWorkspaceOutput,
} from '../workspacesBackendUtils'

export const workspacesGetWorkspaces = protectedProcedure
  .output(zodWorkspaceOutput.array())
  .query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const workspaces = await ctx.prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        openAiApiKey: true,
        balanceInNanoCents: true,
      },
      where: {
        ...workspaceVisibilityFilter(userId),
      },
    })

    return workspaces.map((workspace) => ({
      ...workspace,
      balanceInCents: Number(workspace.balanceInNanoCents) / 10_000_000,
      balanceInNanoCents: undefined,
    }))
  })
