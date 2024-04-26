import { getProviderAndModelFromFullSlug } from '@/server/ai/aiUtils'
import { upsertAiProviderService } from '@/server/ai/services/upsertProviderKVs.service'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { DEFAULT_MODELS_FOR_NEW_WORKSPACE } from '@/shared/globalConfig'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import Promise from 'bluebird'

export const setDefaultsForWorkspaceService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { workspaceId } = uowContext
    await setDefaultEnabledAiModels(prisma, workspaceId)
  })
}

const setDefaultEnabledAiModels = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
) => {
  // Important: Do mapSeries or else it will try to create the same provider twice and fail
  await Promise.mapSeries(DEFAULT_MODELS_FOR_NEW_WORKSPACE, async (slug) => {
    const { model, provider } = getProviderAndModelFromFullSlug(slug)
    await upsertAiProviderService(prisma, workspaceId, provider, undefined, [
      {
        slug: model,
        enabled: true,
      },
    ])
  })
}
