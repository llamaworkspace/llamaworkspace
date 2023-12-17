import type { PostShare, PrismaClient } from '@prisma/client'
import { UserAccessLevel } from '@/shared/globalTypes'

export type PostShareFactoryFields = {
  postId: string
} & Partial<PostShare>

const generateDefaults = () => {
  return {
    accessLevel: UserAccessLevel.Use,
  }
}

export const PostShareFactory = {
  build: (overrides: PostShareFactoryFields) => {
    if (!overrides.userId && !overrides.inviteId) {
      throw new Error('Must provide either userId or inviteId')
    }

    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: PostShareFactoryFields) => {
    const data = PostShareFactory.build(overrides)
    return await prisma.postShare.create({
      data,
    })
  },
}
