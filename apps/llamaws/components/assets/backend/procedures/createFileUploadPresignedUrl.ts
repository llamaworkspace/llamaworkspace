import { createAssetUploadPresignedUrlService } from 'server/assets/services/createAssetUploadPresignedUrl.service'
import { createUserOnWorkspaceContext } from 'server/auth/userOnWorkspaceContext'
import { protectedProcedure } from 'server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
  assetName: z.string(),
})

export const createFileUploadPresignedUrl = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { assetName, workspaceId } = input
    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      workspaceId,
      userId,
    )

    return await createAssetUploadPresignedUrlService(ctx.prisma, context, {
      assetName,
    })
  })
