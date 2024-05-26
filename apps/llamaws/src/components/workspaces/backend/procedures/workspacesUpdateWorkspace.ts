import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import {
  workspaceEditionFilter,
  zodWorkspaceOutput,
} from '../workspacesBackendUtils'

const zInput = z.object({
  workspaceId: z.string(),
  name: z.string().optional(),
})

export const workspacesUpdateWorkspace = protectedProcedure
  .input(zInput)
  .output(zodWorkspaceOutput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { workspaceId, ...payload } = input

    await ctx.prisma.workspace.findFirstOrThrow({
      where: {
        id: workspaceId,
        ...workspaceEditionFilter(userId),
      },
    })

    const workspace = await ctx.prisma.workspace.update({
      where: {
        id: input.workspaceId,
      },
      data: payload,
    })

    return {
      id: workspace.id,
      name: workspace.name,
    }
  })
