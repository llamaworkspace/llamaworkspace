import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { Prisma } from '@prisma/client'

interface GetUserPayload {
  select?: Prisma.UserSelect
}

export const getUserService = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  payload?: GetUserPayload,
) => {
  const select = payload?.select

  return await prisma.user.findFirstOrThrow({
    select,
    where: { id: userId },
  })
}
