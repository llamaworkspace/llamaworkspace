import type { Prisma } from '@prisma/client'
import type { PrismaClientOrTrxClient } from 'shared/globalTypes'

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
