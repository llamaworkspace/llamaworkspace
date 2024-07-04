import { appCreateService } from '@/server/apps/services/appCreate.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import { AppEngineType } from '../../appsTypes'

const zCreateInput = z.object({
  workspaceId: z.string(),
  title: z.optional(z.nullable(z.string())),
})

export const appsCreate = protectedProcedure
  .input(zCreateInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      input.workspaceId,
      userId,
    )

    return await appCreateService(ctx.prisma, context, {
      engineType: AppEngineType.Assistant,
      title: input.title ?? undefined,
    })
  })
