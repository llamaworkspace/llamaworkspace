import { getAppKeyValuesService } from '@/server/apps/services/getAppKeyValues.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  id: z.string(),
})

export const appsKeyValuesGetAll = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { id } = input

    const app = await ctx.prisma.app.findFirstOrThrow({
      where: {
        id,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      app.workspaceId,
      userId,
    )

    return await getAppKeyValuesService(ctx.prisma, context, { appId: app.id })
  })
