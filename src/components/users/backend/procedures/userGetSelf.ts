import { protectedProcedure } from '@/server/trpc/trpc'
import { getUserService } from '@/server/users/services/getUser.service'
import { zodUserOutput } from '../usersBackendUtils'

export const userGetSelf = protectedProcedure
  .output(zodUserOutput)
  .query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const res = await getUserService(ctx.prisma, userId, {
      id: true,
      email: true,
      name: true,
      defaultModel: true,
    })
    return {
      ...res,
      defaultModel: res.defaultModel!,
    }
  })
