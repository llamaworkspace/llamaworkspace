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
    return await updateUserService(ctx.prisma, userId, input)
  })
