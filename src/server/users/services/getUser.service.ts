import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { Prisma } from '@prisma/client'

export const getUserService = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  payload?: Prisma.UserSelect,
) => {
  const select = payload

  return await prisma.user.findFirstOrThrow({
    select,
    where: { id: userId },
  })
}
