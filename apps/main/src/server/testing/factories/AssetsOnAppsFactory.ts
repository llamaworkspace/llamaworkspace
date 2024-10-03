import { AssetOnAppStatus } from '@/shared/globalTypes'
import type { AssetsOnApps, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type AssetsOnAppsFactoryFields = {
  assetId: string
  appId: string
} & Partial<AssetsOnApps>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    status: AssetOnAppStatus.Success,
  }
}

export const AssetsOnAppsFactory = {
  build: (overrides: AssetsOnAppsFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (
    prisma: PrismaClient,
    overrides: AssetsOnAppsFactoryFields,
  ) => {
    return await prisma.assetsOnApps.create({
      data: AssetsOnAppsFactory.build(overrides),
    })
  },
}
