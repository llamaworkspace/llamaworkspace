import { getDefaultAppService } from '@/server/apps/services/getDefaultApp.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

export const postsGetDefault = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      input.workspaceId,
      userId,
    )

    return await getDefaultAppService(ctx.prisma, context)
  })
