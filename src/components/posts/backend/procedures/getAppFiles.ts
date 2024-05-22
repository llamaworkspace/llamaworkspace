import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getAppFilesService } from '@/server/files/services/getAppFiles.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  appId: z.string(),
})

export const getAppFiles = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const app = await ctx.prisma.post.findFirstOrThrow({
      where: {
        id: input.appId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      app.workspaceId,
      userId,
    )

    return await getAppFilesService(ctx.prisma, context, input)
  })
