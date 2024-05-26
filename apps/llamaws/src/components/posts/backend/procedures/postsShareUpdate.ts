import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { updateShareService } from '@/server/shares/services/updateShare.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { ShareScope } from '@/shared/globalTypes'
import { z } from 'zod'

const zInput = z.object({
  shareId: z.string(),
  scope: z.nativeEnum(ShareScope),
})

export const postsShareUpdate = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const share = await ctx.prisma.share.findFirstOrThrow({
      where: {
        id: input.shareId,
      },
      include: {
        post: {
          select: {
            workspaceId: true,
          },
        },
      },
    })

    const workspaceId = share.post.workspaceId

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      workspaceId,
      userId,
    )

    return await updateShareService(ctx.prisma, context, input)
  })
