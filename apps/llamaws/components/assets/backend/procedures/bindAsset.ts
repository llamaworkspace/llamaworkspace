import { bindAssetService } from 'server/assets/services/bindAsset.service'
import { createUserOnWorkspaceContext } from 'server/auth/userOnWorkspaceContext'
import { protectedProcedure } from 'server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  assetId: z.string(),
  appId: z.string(),
})

export const bindAsset = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { assetId } = input
    const asset = await ctx.prisma.asset.findFirstOrThrow({
      where: {
        id: assetId,
      },
    })
    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      asset.workspaceId,
      userId,
    )
    return await bindAssetService(ctx.prisma, context, input)
  })
