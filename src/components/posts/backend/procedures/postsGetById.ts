import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getPostByIdService } from '@/server/posts/services/getPostById.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zByIdInput = z.object({
  id: z.string(),
})

export const postsGetById = protectedProcedure
  .input(zByIdInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const appId = input.id

    const app = await ctx.prisma.app.findFirstOrThrow({
      where: {
        id: appId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      app.workspaceId,
      userId,
    )

    return getPostByIdService(ctx.prisma, context, { appId })
  })
