import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { getUserOnWorkspaceForUserService } from '@/server/workspaces/services/getUserOnWorkspaceForUser.service'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

export const userGetUserOnWorkspace = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { workspaceId } = input

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      workspaceId,
      userId,
    )

    return await getUserOnWorkspaceForUserService(ctx.prisma, context, {
      userId,
    })
  })
