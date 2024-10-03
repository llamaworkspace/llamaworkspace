import { Author } from '@/shared/aiTypesAndMappers'
import { DEFAULT_AI_MODEL } from '@/shared/globalConfig'
import { faker } from '@faker-js/faker'
import type { AppConfigVersion, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

export type AppConfigVersionFactoryFields = {
  appId: string
  systemMessage?: string
} & Partial<AppConfigVersion>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    description: faker.lorem.sentence(),
    model: DEFAULT_AI_MODEL,
  }
}

export const AppConfigVersionFactory = {
  build: (overrides: AppConfigVersionFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (
    prisma: PrismaClient,
    overrides: AppConfigVersionFactoryFields,
  ) => {
    const data = AppConfigVersionFactory.build(overrides)
    const { systemMessage, ...payload } = data
    return await prisma.appConfigVersion.create({
      data: {
        ...payload,
        messages: {
          create: [{ author: Author.System, message: systemMessage }],
        },
      },
    })
  },
}
