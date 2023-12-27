import { faker } from '@faker-js/faker'
import type { PrismaClient, Workspace } from '@prisma/client'

const generateDefaults = () => {
  return {
    id: faker.string.nanoid(),
    name: faker.person.firstName() + "'s workspace",
  }
}

export const WorkspaceFactory = {
  build: (overrides: Partial<Workspace> = {}) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: Partial<Workspace> = {}) => {
    return await prisma.workspace.create({
      data: WorkspaceFactory.build(overrides),
    })
  },
}
