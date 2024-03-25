import { ShareScope, UserAccessLevel } from '@/shared/globalTypes'
import type { PrismaClient, Share } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type ShareFactoryFields = {
  postId: string
  sharerId: string
  workspaceInviteId?: string
  invitedUserId?: string
} & Partial<Share>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    accessLevel: UserAccessLevel.Use,
    scope: ShareScope.User,
  }
}

export const ShareFactory = {
  build: (overrides: ShareFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: ShareFactoryFields) => {
    const { invitedUserId, workspaceInviteId, ...rest } = overrides

    if (!invitedUserId && !workspaceInviteId) {
      throw new Error(
        'You must provide either invitedUserId or workspaceInviteId',
      )
    }

    return await prisma.share.create({
      data: {
        ...ShareFactory.build({
          userId: invitedUserId,
          workspaceInviteId,
          ...rest,
        }),
      },
    })
  },
}
