import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { deleteAppFilesService } from '@/server/files/services/deleteAppFiles.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const zInput = z.object({
  appFileIds: z.string().array(),
})

export const deleteAppFiles = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const appFiles = await ctx.prisma.appFile.findMany({
      select: {
        id: true,
        app: {
          select: {
            workspaceId: true,
          },
        },
      },
      where: {
        id: {
          in: input.appFileIds,
        },
      },
    })

    const workspaceIds = appFiles.map((appFile) => appFile.app.workspaceId)

    if (!workspaceIds.length || workspaceIds.length > 1) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'All app files must belong to the same workspace',
      })
    }

    const workspaceId = workspaceIds[0]!

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      workspaceId,
      userId,
    )

    return await deleteAppFilesService(ctx.prisma, context, input)
  })
