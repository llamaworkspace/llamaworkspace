import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { Prisma } from '@prisma/client'

export const updateUserService = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  payload: Prisma.UserUpdateInput,
) => {
  return await prisma.user.update({
    select: {
      id: true,
      email: true,
      name: true,
      defaultModel: true,
    },
    where: {
      id: userId,
    },
    data: payload,
  })
}
