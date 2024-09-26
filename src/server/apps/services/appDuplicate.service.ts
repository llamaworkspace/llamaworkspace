import { AppEngineType } from '@/components/apps/appsTypes'
import { getEnumByValue } from '@/lib/utils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import {
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { appCreateService } from './appCreate.service'
import { getLatestAppConfigForAppIdService } from './getLatestAppConfigForAppId.service'

interface AppDuplicateServiceProps {
  appId: string
}

export const appDuplicateService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: AppDuplicateServiceProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId, workspaceId } = uowContext
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    })

    const baseApp = await prisma.app.findUniqueOrThrow({
      where: {
        id: input.appId,
      },
    })

    const baseAppConfigVersion = await getLatestAppConfigForAppIdService(
      prisma,
      uowContext,
      { appId: baseApp.id },
    )

    const duplicatedApp = await appCreateService(prisma, uowContext, {
      engineType: getEnumByValue(AppEngineType, baseApp.engineType),
      title: 'Copy of ' + baseApp.title,
      emoji: baseApp.emoji ?? undefined,
    })

    const duplicatedAppConfigVersion =
      await prisma.appConfigVersion.findFirstOrThrow({
        where: {
          appId: baseApp.id,
        },
      })

    // Update the duplicated app config version with the latest version's data
    await prisma.appConfigVersion.update({
      where: { id: duplicatedAppConfigVersion.id },
      data: {
        model: baseAppConfigVersion.model,
        description: baseAppConfigVersion.description,
        preprocessAssets: baseAppConfigVersion.preprocessAssets,
      },
    })

    return duplicatedApp
  })
}
