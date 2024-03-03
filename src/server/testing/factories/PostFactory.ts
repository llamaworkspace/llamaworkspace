import { faker } from '@faker-js/faker'
import type { Post, PrismaClient } from '@prisma/client'
import { WorkspaceFactory } from './WorkspaceFactory'

type PostFactoryFields = {
  userId: string
} & Partial<Post>

const generateDefaults = () => {
  return {
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

    const post = await prisma.post.create({
      data: {
        ...rest,
        workspaceId: workspace.id,
      },
    })

    return post
  },
}
