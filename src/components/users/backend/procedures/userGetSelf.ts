import { protectedProcedure } from '@/server/trpc/trpc'
import { zodUserOutput } from '../usersBackendUtils'

export const userGetSelf = protectedProcedure
  .output(zodUserOutput)
  .query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const res = await ctx.prisma.user.findFirstOrThrow({
      where: { id: userId },
    })

    return {
      id: res.id,
      email: res.email,
      name: res.name,
      defaultOpenaiModel: res.defaultOpenaiModel,
    }
  })
