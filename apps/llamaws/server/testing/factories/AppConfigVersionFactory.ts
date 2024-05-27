import { faker } from '@faker-js/faker'
import type { AppConfigVersion, PrismaClient } from '@prisma/client'
import { Author } from 'shared/aiTypesAndMappers'
import { DEFAULT_AI_MODEL } from 'shared/globalConfig'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

export type AppConfigVersionFactoryFields = {
  appId: string
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
    return await prisma.appConfigVersion.create({
      data: {
        ...data,
        messages: {
          create: [{ author: Author.System }],
        },
      },
    })
  },
}
