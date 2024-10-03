import { AssetUploadStatus } from '@/components/assets/assetTypes'
import type { Asset, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

export type AssetFactoryFields = {
  workspaceId: string
  originalName: string
} & Partial<Asset>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    uploadStatus: AssetUploadStatus.Pending,
  }
}

export const AssetFactory = {
  build: (overrides: AssetFactoryFields) => {
    const defaults = generateDefaults()
    const splitFileName = overrides.originalName.split('.')
    const extension = splitFileName.length > 1 ? `.${splitFileName.pop()}` : ''

    const path = `workspaces/workspaceId/apps/${defaults.id}${extension}`

    return {
      path,
      extension,
      ...defaults,
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: AssetFactoryFields) => {
    const data = AssetFactory.build(overrides)
    return await prisma.asset.create({
      data,
    })
  },
}
