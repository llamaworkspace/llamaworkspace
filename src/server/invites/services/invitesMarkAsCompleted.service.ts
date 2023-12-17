import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const invitesMarkAsCompleted = async function (
  prisma: PrismaClientOrTrxClient,
  token: string,
) {
  return await prisma.invite.update({
    where: {
      token: token,
    },
    data: {
      completedAt: new Date(),
    },
  })
}
