import type { ChatRun, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type ChatRunFactoryFields = {
  chatId: string
} & Partial<ChatRun>

const generateDefaults = () => {
  return generateBaseForDefaults()
}

export const ChatRunFactory = {
  build: (overrides: ChatRunFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: ChatRunFactoryFields) => {
    const data = ChatRunFactory.build(overrides)
    return await prisma.chatRun.create({
      data,
    })
  },
}
