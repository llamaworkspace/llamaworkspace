import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { inviteToWorkspace } from '@/server/workspaces/services/inviteToWorkspace'
import {
  PrismaTrxClient,
  ShareScope,
  UserAccessLevel,
  type PrismaClientOrTrxClient,
} from '@/shared/globalTypes'
import { TRPCError } from '@trpc/server'

interface PerformSharePaylaod {
  email: string
  postId: string
}

export const performShare = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: PerformSharePaylaod,
) => {
  const { userId: invitingUserId, workspaceId } = uowContext
  const { email, postId } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    const invitedUser = await prisma.user.findFirst({
      where: {
        email,
      },
    })

    if (!invitedUser) {
      return await handleInvitedUserDoesNotExist(
        prisma,
        workspaceId,
        invitingUserId,
        email,
        postId,
      )
    }

    return await handleInvitedUserExists(
      prisma,
      invitingUserId,
      invitedUser.id,
      postId,
    )
  })
}

const handleInvitedUserDoesNotExist = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  invitingUserId: string,
  email: string,
  postId: string,
) => {
  const invite = await inviteToWorkspace(
    prisma,
    workspaceId,
    invitingUserId,
    email,
  )

  if (!invite) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to invite user to workspace. An invite was expected.',
    })
  }

  return await prisma.share.create({
    data: {
      postId,
      sharerId: invitingUserId,
      scope: ShareScope.User,
      accessLevel: UserAccessLevel.Use,
      shareUsersOrInvites: {
        create: {
          workspaceInviteId: invite.id,
        },
      },
    },
  })
}

const handleInvitedUserExists = async (
  prisma: PrismaTrxClient,
  invitingUserId: string,
  invitedUserId: string,
  postId: string,
) => {
  return await prisma.share.create({
    data: {
      postId: postId,
      sharerId: invitingUserId,
      scope: ShareScope.User,
      accessLevel: UserAccessLevel.Use,
      shareUsersOrInvites: {
        create: {
          userId: invitedUserId,
        },
      },
    },
  })
}
