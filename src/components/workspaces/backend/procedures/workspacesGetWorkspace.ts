import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import {
  workspaceVisibilityFilter,
  zodWorkspaceOutput,
} from '../workspacesBackendUtils'

const zInput = z.object({
  workspaceId: z.string().optional(),
})

export const workspacesGetWorkspace = protectedProcedure
  .input(zInput)
  .output(zodWorkspaceOutput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const workspace = await ctx.prisma.workspace.findFirstOrThrow({
      select: {
        id: true,
        name: true,
        openAiApiKey: true,
        balanceInNanoCents: true,
      },
      where: {
        id: input.workspaceId,
        ...workspaceVisibilityFilter(userId),
      },
    })

    return {
      ...workspace,
      balanceInCents: Number(workspace.balanceInNanoCents) / 10_000_000,
      balanceInNanoCents: undefined,
    }
  })
