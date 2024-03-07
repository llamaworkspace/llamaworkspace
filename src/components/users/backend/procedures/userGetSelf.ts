import { protectedProcedure } from '@/server/trpc/trpc'
import { getUserService } from '@/server/users/services/getUser.service'
import { zodUserOutput } from '../usersBackendUtils'

export const userGetSelf = protectedProcedure
  .output(zodUserOutput)
  .query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return await getUserService(ctx.prisma, userId)
  })
