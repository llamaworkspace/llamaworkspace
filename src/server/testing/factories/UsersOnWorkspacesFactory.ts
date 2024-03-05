import type { PrismaClient, UsersOnWorkspaces } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type UsersOnWorkspacesFactoryFields = {
  userId: string
  workspaceId: string
} & Partial<UsersOnWorkspaces>

const generateDefaults = () => {
  return generateBaseForDefaults()
}

export const UsersOnWorkspacesFactory = {
  build: (overrides: UsersOnWorkspacesFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (
    prisma: PrismaClient,
    overrides: UsersOnWorkspacesFactoryFields,
  ) => {
    return await prisma.usersOnWorkspaces.create({
      data: UsersOnWorkspacesFactory.build(overrides),
    })
  },
}
