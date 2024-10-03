import { UserAccessLevel } from '@/shared/globalTypes'
import type { PrismaClient, ShareTarget } from '@prisma/client'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type ShareTargetFactoryFields = {
  shareId: string
  sharerId: string
  workspaceInviteId?: string
  userId?: string
} & Partial<ShareTarget>

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
    accessLevel: UserAccessLevel.Use,
  }
}

export const ShareTargetFactory = {
  build: (overrides: ShareTargetFactoryFields) => {
    return {
      ...generateDefaults(),
      ...overrides,
    }
  },

  create: async (prisma: PrismaClient, overrides: ShareTargetFactoryFields) => {
    const { userId, workspaceInviteId } = overrides

    if (!userId && !workspaceInviteId) {
      throw new Error(
        'You must provide either invitedUserId or workspaceInviteId',
      )
    }

    return await prisma.shareTarget.create({
      data: {
        ...ShareTargetFactory.build(overrides),
      },
    })
  },
}
