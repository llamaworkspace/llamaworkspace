import { protectedProcedure } from '@/server/trpc/trpc'
import {
  workspaceVisibilityFilter,
  zodWorkspaceOutput,
} from '../workspacesBackendUtils'

export const workspacesGetFirstWorkspaceForUser = protectedProcedure
  .output(zodWorkspaceOutput)
  .query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const workspace = await ctx.prisma.workspace.findFirstOrThrow({
      select: {
        id: true,
        name: true,
        balanceInNanoCents: true,
        isOnboardingCompleted: true,
      },
      where: {
        ...workspaceVisibilityFilter(userId),
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return {
      ...workspace,
      balanceInCents: Number(workspace.balanceInNanoCents) / 10_000_000,
      balanceInNanoCents: undefined,
    }
  })
