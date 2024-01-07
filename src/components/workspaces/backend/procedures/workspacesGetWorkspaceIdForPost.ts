import { postVisibilityFilter } from '@/components/posts/backend/postsBackendUtils'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import { zodWorkspaceOutput } from '../workspacesBackendUtils'

const zInput = z.object({
  postId: z.string(),
})

export const workspacesGetWorkspaceIdForPost = protectedProcedure
  .input(zInput)
  .output(zodWorkspaceOutput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const post = await ctx.prisma.post.findFirstOrThrow({
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            balanceInNanoCents: true,
            isOnboardingCompleted: true,
          },
        },
      },
      where: {
        id: input.postId,
        ...postVisibilityFilter(userId),
      },
    })

    return {
      ...post.workspace,
      balanceInCents: Number(post.workspace.balanceInNanoCents) / 10_000_000,
      balanceInNanoCents: undefined,
    }
  })
