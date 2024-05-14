import { Author } from '@/shared/aiTypesAndMappers'
import { DEFAULT_AI_MODEL } from '@/shared/globalConfig'
import { faker } from '@faker-js/faker'
import type { PostConfigVersion, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

export type PostConfigVersionFactoryFields = {
  postId: string
} & Partial<PostConfigVersion>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    description: faker.lorem.sentence(),
    model: DEFAULT_AI_MODEL,
  }
}

export const PostConfigVersionFactory = {
  build: (overrides: PostConfigVersionFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (
    prisma: PrismaClient,
    overrides: PostConfigVersionFactoryFields,
  ) => {
    const data = PostConfigVersionFactory.build(overrides)
    return await prisma.postConfigVersion.create({
      data: {
        ...data,
        messages: {
          create: [{ author: Author.System }],
        },
      },
    })
  },
}
