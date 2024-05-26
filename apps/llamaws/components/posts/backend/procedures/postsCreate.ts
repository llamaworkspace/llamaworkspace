import { createUserOnWorkspaceContext } from 'server/auth/userOnWorkspaceContext'
import { postCreateService } from 'server/posts/services/postCreate.service'
import { protectedProcedure } from 'server/trpc/trpc'
import { z } from 'zod'

const zCreateInput = z.object({
  workspaceId: z.string(),
  title: z.optional(z.nullable(z.string())),
})

export const postsCreate = protectedProcedure
  .input(zCreateInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      input.workspaceId,
      userId,
    )

    return await postCreateService(ctx.prisma, context, {
      title: input.title ?? undefined,
    })
  })
