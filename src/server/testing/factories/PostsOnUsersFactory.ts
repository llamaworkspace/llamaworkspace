import type { PostsOnUsers, PrismaClient } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type PostsOnUsersFactoryFields = {
  userId: string
  postId: string
} & Partial<PostsOnUsers>

const generateDefaults = () => {
  return generateBaseForDefaults()
}

export const PostsOnUsersFactory = {
  build: (overrides: PostsOnUsersFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (
    prisma: PrismaClient,
    overrides: PostsOnUsersFactoryFields,
  ) => {
    return await prisma.appsOnUsers.create({
      data: PostsOnUsersFactory.build(overrides),
    })
  },
}
