import { bindAssetToAppService } from '@/server/assets/services/bindAssetToApp.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  assetId: z.string(),
  appId: z.string(),
})

export const bindAssetToApp = protectedProcedure
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
    return await bindAssetToAppService(ctx.prisma, context, input)
  })
