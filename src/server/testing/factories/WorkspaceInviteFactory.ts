import { faker } from '@faker-js/faker'
import type { PrismaClient, WorkspaceInvite } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type WorkspaceInviteFactoryFields = {
  workspaceId: string
  email: string
} & Partial<WorkspaceInvite>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    token: faker.string.uuid(),
  }
}

export const WorkspaceInviteFactory = {
  build: (overrides: WorkspaceInviteFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (
    prisma: PrismaClient,
    overrides: WorkspaceInviteFactoryFields,
  ) => {
    const data = WorkspaceInviteFactory.build(overrides)
    return await prisma.workspaceInvite.create({
      data,
    })
  },
}
