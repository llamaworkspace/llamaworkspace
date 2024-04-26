import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { DEFAULT_AI_MODEL } from '@/shared/globalConfig'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'

export const createDefaultsForNewUserService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { userId } = uowContext
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
