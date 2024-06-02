import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getPostSharesService } from '@/server/shares/services/getPostShares.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  appId: z.string(),
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
  appId: z.string(),
  scope: z.string(),
  shareTargets: zShareTargets,
})

export const postsGetShare = protectedProcedure
  .input(zInput)
  .output(zOutput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { appId } = input

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

    const share = await getPostSharesService(ctx.prisma, context, { appId })

    return {
      id: share.id,
      appId: share.appId,
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
