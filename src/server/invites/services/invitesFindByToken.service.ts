import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const invitesFindByTokenService = async function (
  prisma: PrismaClientOrTrxClient,
  token: string,
) {
  return await prisma.invite.findFirstOrThrow({
    where: {
      token,
    },
    include: {
      invitedBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })
}
