import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const settlePostSharesForNewUserService = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    })

    const invites = await prisma.invite.findMany({
      where: {
        email: user.email!,
      },
    })

    const inviteIds = invites.map((invite) => invite.id)

    await prisma.postShare.updateMany({
      where: {
        inviteId: {
          in: inviteIds,
        },
      },
      data: {
        userId,
      },
    })
  })
}
