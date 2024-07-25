import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'

export const setDefaultsForWorkspaceService = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    await setDefaultEnabledAiModels(prisma, workspaceId)
  })
}

const setDefaultEnabledAiModels = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
) => {
  // Important: Do mapSeries or else it will try to create the same provider twice and fail
  // await Promise.mapSeries(DEFAULT_MODELS_FOR_NEW_WORKSPACE, async (slug) => {
  //   const { model, provider } = getProviderAndModelFromFullSlug(slug)
  //   await upsertAiProviderService(prisma, workspaceId, provider, undefined, [
  //     {
  //       slug: model,
  //       enabled: true,
  //     },
  //   ])
  // })
}
