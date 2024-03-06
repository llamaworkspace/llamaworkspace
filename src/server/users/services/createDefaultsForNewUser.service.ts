import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { DEFAULT_AI_MODEL } from '@/shared/globalConfig'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'

export const createDefaultsForNewUserService = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    await setDefaultModelForUser(prisma, userId)
  })
}

const setDefaultModelForUser = async (
  prisma: PrismaTrxClient,
  userId: string,
) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      defaultModel: DEFAULT_AI_MODEL,
    },
  })
}
