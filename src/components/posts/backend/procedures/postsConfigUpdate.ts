import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { postConfigVersionUpdateService } from '@/server/posts/services/postConfigVersionUpdate.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zUpdate = z.object({
  id: z.string(),
  description: z.string().optional().nullable(),
  systemMessage: z.string().optional(),
  model: z.string().optional(),
})

export const postsConfigUpdate = protectedProcedure
  .input(zUpdate)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { id } = input

    const postConfigVersion =
      await ctx.prisma.postConfigVersion.findFirstOrThrow({
        where: {
          id,
        },
        include: { post: true },
      })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      postConfigVersion.post.workspaceId,
      userId,
    )

    return await postConfigVersionUpdateService(ctx.prisma, context, input)
  })
