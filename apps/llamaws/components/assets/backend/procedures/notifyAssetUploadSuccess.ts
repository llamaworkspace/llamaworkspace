import { updateAssetService } from 'server/assets/services/updateAsset.service'
import { createUserOnWorkspaceContext } from 'server/auth/userOnWorkspaceContext'
import { protectedProcedure } from 'server/trpc/trpc'
import { z } from 'zod'
import { AssetUploadStatus } from '../../assetTypes'

const zInput = z.object({
  assetId: z.string(),
})

export const notifyAssetUploadSuccess = protectedProcedure
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
    return await updateAssetService(ctx.prisma, context, {
      assetId: assetId,
      uploadStatus: AssetUploadStatus.Success,
    })
  })
