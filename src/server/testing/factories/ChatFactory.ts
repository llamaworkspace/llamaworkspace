import type { Chat, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type ChatFactoryFields = {
  postId: string
  authorId: string
} & Partial<Chat>

const generateDefaults = () => {
  return generateBaseForDefaults()
}

export const ChatFactory = {
  build: (overrides: ChatFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: ChatFactoryFields) => {
    const data = ChatFactory.build(overrides)
    return await prisma.chat.create({
      data,
    })
  },
}
