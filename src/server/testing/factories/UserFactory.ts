import { OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import { faker } from '@faker-js/faker'
import type { PrismaClient, User } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type UserFactoryFields = {
  workspaceId?: string
} & Partial<User>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    name: faker.person.fullName(),
    image: faker.image.avatar(),
    username: faker.internet.userName(),
    email: faker.string.nanoid() + faker.internet.email(),
    emailVerified: faker.date.past(),
    defaultModel: OpenAiModelEnum.GPT3_5_TURBO,
  }
}

export const UserFactory = {
  build: (overrides: UserFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: UserFactoryFields) => {
    const { workspaceId, ...rest } = overrides

    if (!workspaceId) {
      return await prisma.user.create({ data: UserFactory.build(rest) })
    }
    return await prisma.user.create({
      data: {
        ...UserFactory.build(rest),
        workspaces: {
          create: {
            workspaceId,
          },
        },
      },
    })
  },
}
