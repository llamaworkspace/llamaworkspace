import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { updateShareAccessLevelService } from '@/server/shares/services/updateShareAccessLevel.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { UserAccessLevelActions } from '@/shared/globalTypes'
import { z } from 'zod'

const zInput = z.object({
  shareTargetId: z.string(),
  accessLevel: z.nativeEnum(UserAccessLevelActions),
})

export const postsShareUpdateAccessLevel = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const share = await ctx.prisma.share.findFirstOrThrow({
      where: {
        shareTargets: {
          some: {
            id: input.shareTargetId,
          },
        },
      },
      include: {
        app: {
          select: {
            workspaceId: true,
          },
        },
      },
    })

    const workspaceId = share.app.workspaceId

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      workspaceId,
      userId,
    )

    return await updateShareAccessLevelService(ctx.prisma, context, input)
  })
