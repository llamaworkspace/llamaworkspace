import { faker } from '@faker-js/faker'
import type { Invite, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type InviteFactoryFields = {
  invitedById: string
} & Partial<Invite>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    email: faker.internet.email(),
    token: faker.string.uuid(),
  }
}

export const InviteFactory = {
  build: (overrides: InviteFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: InviteFactoryFields) => {
    const data = InviteFactory.build(overrides)
    return await prisma.invite.create({
      data,
    })
  },
}
