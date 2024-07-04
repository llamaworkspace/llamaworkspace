import { appAttachAssetService } from '@/server/apps/services/appAttachAsset.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  appId: z.string(),
  assetId: z.string(),
})

export const appsAttachAsset = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
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
    return await appAttachAssetService(ctx.prisma, context, input)
  })
