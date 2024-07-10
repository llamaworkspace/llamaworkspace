import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import { scopeAppByWorkspace } from '../appUtils'

export const updateAppSortingService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  appIdToPushToPosition1: string,
) => {
  const { workspaceId, userId } = uowContext

  return prismaAsTrx(prisma, async (prisma) => {
    await prisma.app.findFirstOrThrow({
      where: scopeAppByWorkspace(
        {
          id: appIdToPushToPosition1,
          markAsDeletedAt: null,
        },
        workspaceId,
      ),
    })

    const existingAppsWithPosition = await prisma.appsOnUsers.findFirst({
      where: {
        userId,
        appId: appIdToPushToPosition1,
        position: {
          not: null,
        },
      },
      select: {
        appId: true,
      },
    })

    if (existingAppsWithPosition) {
      return
    }

    await nullifyAppsWithPositionGte5(prisma, userId)
    await updateExistingPositions(prisma, userId)
    await pushAppToPosition1(prisma, userId, appIdToPushToPosition1)
  })
}

const nullifyAppsWithPositionGte5 = async (
  prisma: PrismaTrxClient,
  userId: string,
) => {
  await prisma.appsOnUsers.updateMany({
    where: {
      userId,
      position: {
        gte: 5,
      },
    },
    data: {
      position: null,
    },
  })
}

const updateExistingPositions = async (
  prisma: PrismaTrxClient,
  userId: string,
) => {
  await prisma.appsOnUsers.updateMany({
    where: {
      userId,
      position: {
        not: null,
      },
    },
    data: {
      position: {
        increment: 1,
      },
    },
  })
}

const pushAppToPosition1 = async (
  prisma: PrismaTrxClient,
  userId: string,
  appId: string,
) => {
  await prisma.appsOnUsers.upsert({
    where: {
      userId_appId: {
        appId,
        userId,
      },
    },
    update: {
      position: 1,
    },
    create: {
      appId,
      userId,
      position: 1,
    },
  })
}
