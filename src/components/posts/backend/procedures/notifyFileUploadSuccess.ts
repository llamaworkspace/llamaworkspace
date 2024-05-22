import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { updateAppFileService } from '@/server/files/services/updateAppFile.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import { FileUploadStatus } from '../../postsTypes'

const zInput = z.object({
  appFileId: z.string(),
})

export const notifyFileUploadSuccess = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { appFileId } = input

    const appFile = await ctx.prisma.appFile.findFirstOrThrow({
      where: {
        id: appFileId,
      },
      include: {
        app: true,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      appFile.app.workspaceId,
      userId,
    )
    return await updateAppFileService(ctx.prisma, context, {
      appFileId,
      status: FileUploadStatus.Success,
    })
  })
