import { AppEngineType } from '@/components/apps/appsTypes'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { DEFAULT_APP_NAME } from '../appConstants'
import { appCreateService } from './appCreate.service'

export const createDefaultAppService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { userId } = uowContext

    const app = await appCreateService(prisma, uowContext, {
      title: DEFAULT_APP_NAME,
      isDefault: true,
      engineType: AppEngineType.Default,
    })

    await prisma.chat.deleteMany({
      where: {
        appId: app.id,
        authorId: userId,
      },
    })

    return app
  })
}
