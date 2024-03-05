import { Author } from '@/shared/aiTypesAndMappers'
import { faker } from '@faker-js/faker'
import type { Message, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type MessageFactoryFields = Partial<Message>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    author: Author.User,
    message: faker.lorem.sentence(),
  }
}

export const MessageFactory = {
  build: (overrides: MessageFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: MessageFactoryFields) => {
    const data = MessageFactory.build(overrides)
    return await prisma.message.create({
      data,
    })
  },
}
