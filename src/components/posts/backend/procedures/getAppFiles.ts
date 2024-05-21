import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getAppFilesService } from '@/server/posts/services/getAppFiles.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  appId: z.string(),
})

export const getAppFiles = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const appFile = await ctx.prisma.appFile.findFirstOrThrow({
      where: {
        appId: input.appId,
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

    return await getAppFilesService(ctx.prisma, context, input)
  })
