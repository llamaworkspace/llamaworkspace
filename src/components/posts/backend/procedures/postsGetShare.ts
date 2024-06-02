import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getPostSharesService } from '@/server/shares/services/getPostShares.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  postId: z.string(),
})

const zShareTargets = z.array(
  z.object({
    id: z.string(),
    email: z.string(),
    accessLevel: z.string(),
    userId: z.string().nullable(),
    workspaceInviteId: z.string().nullable(),
  }),
)

const zOutput = z.object({
  id: z.string(),
  postId: z.string(),
  scope: z.string(),
  shareTargets: zShareTargets,
})

export const postsGetShare = protectedProcedure
  .input(zInput)
  .output(zOutput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { postId } = input

    const app = await ctx.prisma.app.findFirstOrThrow({
      where: {
        id: postId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      post.workspaceId,
      userId,
    )

    const share = await getPostSharesService(ctx.prisma, context, { postId })

    return {
      id: share.id,
      postId: share.postId,
      scope: share.scope,
      shareTargets: share.shareTargets.map((shareTarget) => {
        return {
          id: shareTarget.id,
          email: shareTarget.user?.email ?? shareTarget.workspaceInvite?.email!,
          accessLevel: shareTarget.accessLevel,
          userId: shareTarget.userId,
          workspaceInviteId: shareTarget.workspaceInviteId,
        }
      }),
    }
  })
