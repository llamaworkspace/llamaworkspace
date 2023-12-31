import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { DEFAULT_AI_MODEL } from '@/shared/globalConfig'
import {
  PrismaTrxClient,
  type PrismaClientOrTrxClient,
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
      defaultOpenaiModel: DEFAULT_AI_MODEL,
    },
  })
}
