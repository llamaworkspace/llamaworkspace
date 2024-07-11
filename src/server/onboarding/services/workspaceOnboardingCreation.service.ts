import { AppEngineType } from '@/components/apps/appsTypes'
import { appCreateService } from '@/server/apps/services/appCreate.service'
import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { ShareScope, type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { onboardingTexts } from './onboardingTexts'

export const workspaceOnboardingCreationService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const demoApp = await appCreateService(prisma, uowContext, {
      title: `Fun facts teller`,
      emoji: '1f920', // Cowboy emoji 🤠
      isDemo: true,
      engineType: AppEngineType.Assistant,
    })

    await prisma.share.update({
      where: {
        appId: demoApp.id,
      },
      data: {
        scope: ShareScope.Everybody,
      },
    })

    const appConfigVersion = await prisma.appConfigVersion.findFirstOrThrow({
      where: {
        appId: demoApp.id,
      },
    })

    const firstMessage = await prisma.message.findFirstOrThrow({
      where: {
        appConfigVersionId: appConfigVersion.id,
      },
    })

    await prisma.appConfigVersion.update({
      where: {
        id: appConfigVersion.id,
      },
      data: {
        description: onboardingTexts.description,
      },
    })

    await prisma.message.update({
      where: {
        id: firstMessage.id,
      },
      data: {
        message: onboardingTexts.systemMessage,
      },
    })
  })
}
