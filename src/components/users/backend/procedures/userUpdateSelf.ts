import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import { zodUserOutput } from '../usersBackendUtils'

const zInput = z.object({
  defaultOpenaiModel: z.string().optional(),
})

export const userUpdateSelf = protectedProcedure
  .input(zInput)
  .output(zodUserOutput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const res = await ctx.prisma.user.update({
      where: {
        id: userId,
      },
      data: { ...input },
    })

    return {
      id: res.id,
      email: res.email,
      name: res.name,
      defaultOpenaiModel: res.defaultOpenaiModel,
    }
  })
