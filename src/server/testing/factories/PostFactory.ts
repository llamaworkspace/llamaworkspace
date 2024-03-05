import { faker } from '@faker-js/faker'
import type { Post, PrismaClient } from '@prisma/client'
import { WorkspaceFactory } from './WorkspaceFactory'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type PostFactoryFields = {
  userId: string
} & Partial<Post>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    title: faker.lorem.sentence(),
  }
}

export const PostFactory = {
  build: (overrides: PostFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: PostFactoryFields) => {
    const { workspaceId, ...rest } = PostFactory.build(overrides)

    if (workspaceId) {
      return await prisma.post.create({
        data: { workspaceId, ...PostFactory.build(rest) },
      })
    }

    const workspace = await WorkspaceFactory.create(prisma)

    return await prisma.post.create({
      data: {
        ...rest,
        workspaceId: workspace.id,
      },
    })
  },
}
