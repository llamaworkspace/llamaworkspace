import { OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import { faker } from '@faker-js/faker'
import type { PrismaClient, User } from '@prisma/client'

type UserFactoryFields = {
  workspaceId?: string
} & Partial<User>

const generateDefaults = () => {
  return {
    name: faker.person.fullName(),
    username: faker.internet.userName(),
    email: faker.string.nanoid() + faker.internet.email(),
    emailVerified: faker.date.past(),
    defaultOpenaiModel: OpenAiModelEnum.GPT3_5_TURBO,
  }
}

export const UserFactory = {
  build: (overrides: Partial<User>) => {
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
