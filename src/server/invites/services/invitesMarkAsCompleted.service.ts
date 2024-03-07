import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const invitesMarkAsCompletedService = async function (
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
