import { protectedProcedure } from '@/server/trpc/trpc'
import { updateUserService } from '@/server/users/services/updateUser.service'
import { z } from 'zod'
import { zodUserOutput } from '../usersBackendUtils'

const zInput = z.object({
  defaultModel: z.string().optional(),
})

export const userUpdateSelf = protectedProcedure
  .input(zInput)
  .output(zodUserOutput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const res = await updateUserService(ctx.prisma, userId, input)
    return {
      ...res,
      defaultModel: res.defaultModel!,
    }
  })
