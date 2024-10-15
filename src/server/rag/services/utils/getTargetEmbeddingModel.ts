import { AppEngineType } from '@/components/apps/appsTypes'
import { getLatestAppConfigForAppIdService } from '@/server/apps/services/getLatestAppConfigForAppId.service'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { App } from '@prisma/client'

export const getTargetEmbeddingModel = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  app: App,
) => {
  if (app.engineType === AppEngineType.Assistant.toString()) {
    return 'openai'
  }
  const appConfig = await getLatestAppConfigForAppIdService(
    prisma,
    uowContext,
    {
      appId: app.id,
    },
  )
  const model = appConfig.model
  if (model.startsWith('openai')) {
    return 'openai'
  }
  return 'huggingface'
}
