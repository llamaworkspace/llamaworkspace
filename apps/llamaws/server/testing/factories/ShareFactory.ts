import type { PrismaClient, Share } from '@prisma/client'
import { ShareScope, UserAccessLevel } from 'shared/globalTypes'
import { generateBaseForDefaults } from './utils/testingFactoryUtils'

type ShareFactoryFields = {
  postId: string
} & Partial<Share>

type ShareTargetFactoryFields = {
  sharerId: string
  workspaceInviteId?: string
  userId?: string
}

type OverridesPayload = ShareFactoryFields & ShareTargetFactoryFields

const generateDefaults = () => {
  return {
    ...generateBaseForDefaults(),
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

  create: async (prisma: PrismaClient, overrides: OverridesPayload) => {
    const { userId, sharerId, workspaceInviteId, ...rest } = overrides

    if (!userId && !workspaceInviteId) {
      throw new Error(
        'You must provide either invitedUserId or workspaceInviteId',
      )
    }

    return await prisma.share.create({
      data: {
        ...ShareFactory.build(rest),
        shareTargets: {
          create: [
            {
              sharerId,
              userId,
              workspaceInviteId,
              accessLevel: UserAccessLevel.Use,
            },
          ],
        },
      },
    })
  },
}
