import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getDefaultPostService } from '@/server/posts/services/getDefaultPost.service'
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

    return await getDefaultPostService(ctx.prisma, context)
  })
