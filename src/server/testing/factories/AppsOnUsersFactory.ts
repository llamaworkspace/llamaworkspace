import type { AppsOnUsers, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type AppsOnUsersFactoryFields = {
  userId: string
  postId: string
} & Partial<AppsOnUsers>

const generateDefaults = () => {
  return generateBaseForDefaults()
}

export const AppsOnUsersFactory = {
  build: (overrides: AppsOnUsersFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: AppsOnUsersFactoryFields) => {
    return await prisma.appsOnUsers.create({
      data: AppsOnUsersFactory.build(overrides),
    })
  },
}
