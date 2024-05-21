import { AppFileStatus } from '@/components/posts/postsTypes'
import type { AppFile, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

export type AppFileFactoryFields = {
  appId: string
  originalName: string
} & Partial<AppFile>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    status: AppFileStatus.Pending,
  }
}

export const AppFileFactory = {
  build: (overrides: AppFileFactoryFields) => {
    const defaults = generateDefaults()
    const splitFileName = overrides.originalName.split('.')
    const extension = splitFileName.length > 1 ? `.${splitFileName.pop()}` : ''

    const path = `workspaces/workspaceId/apps/${overrides.appId}${extension}`

    return {
      path,
      extension,
      ...defaults,
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: AppFileFactoryFields) => {
    const data = AppFileFactory.build(overrides)
    return await prisma.appFile.create({
      data,
    })
  },
}
