import { postCreateRepo } from '@/server/posts/repositories/postsCreateRepo'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zCreateInput = z.object({
  workspaceId: z.string(),
  title: z.optional(z.nullable(z.string())),
})

export const postsCreate = protectedProcedure
  .input(zCreateInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { workspaceId } = input

    return await postCreateRepo(ctx.prisma, workspaceId, userId, {
      title: input.title ?? undefined,
    })
  })
