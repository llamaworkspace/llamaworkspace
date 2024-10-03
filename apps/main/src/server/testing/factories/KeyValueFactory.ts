import type { KeyValueType } from '@/shared/globalTypes'
import type { KeyValue, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type KeyValueFactoryFields = {
  appId: string
  key: string
  value: string
  type: KeyValueType
} & Partial<KeyValue>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
  }
}

export const KeyValueFactory = {
  build: (overrides: KeyValueFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: KeyValueFactoryFields) => {
    return await prisma.keyValue.create({
      data: KeyValueFactory.build(overrides),
    })
  },
}
