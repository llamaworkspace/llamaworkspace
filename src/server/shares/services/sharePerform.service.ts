import { env } from '@/env.mjs'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { sendEmail } from '@/server/mailer/mailer'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { inviteToWorkspaceService } from '@/server/workspaces/services/inviteToWorkspace.service'
import { WorkspaceInviteSources } from '@/server/workspaces/workspaceTypes'
import {
  UserAccessLevel,
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { WorkspaceInvite } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { getPostSharesService } from './getPostShares.service'

const USER_ALREADY_INVITED_ERROR = 'You have already invited this user'

interface SharePerformPayload {
  email: string
  postId: string
}

export const sharePerformService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: SharePerformPayload,
) => {
  const { userId: invitingUserId } = uowContext
  const { email, postId } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Invite,
      invitingUserId,
      postId,
    )

    const invitedUser = await prisma.user.findFirst({
      where: {
        email,
      },
    })

    if (!invitedUser) {
      return await handleInvitedUserDoesNotExist(
        prisma,
        uowContext,
        email,
        postId,
      )
    }

    return await handleInvitedUserExists(
      prisma,
      invitingUserId,
      invitedUser.id,
      uowContext,
      postId,
    )
  })
}

const handleInvitedUserDoesNotExist = async (
  prisma: PrismaTrxClient,
  uowContext: UserOnWorkspaceContext,
  email: string,
  postId: string,
) => {
  const { workspaceId, userId: invitingUserId } = uowContext
  // Check if already invited to the workspace
  let workspaceInvite: WorkspaceInvite | null = null

  workspaceInvite = await prisma.workspaceInvite.findFirst({
    where: {
      email,
      workspaceId,
    },
  })

  if (!workspaceInvite) {
    workspaceInvite = await inviteToWorkspaceService(
      prisma,
      uowContext,
      email,
      true,
      WorkspaceInviteSources.Share,
    )

    if (!workspaceInvite) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to invite user to workspace. An invite was expected.',
      })
    }
  }

  const shareForInvitedUser = await prisma.share.findFirst({
    where: {
      postId,
      shareTargets: {
        some: {
          workspaceInviteId: workspaceInvite.id,
        },
      },
    },
  })

  if (shareForInvitedUser) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: USER_ALREADY_INVITED_ERROR,
    })
  }

  const share = await getShare(prisma, postId)

  await prisma.shareTarget.create({
    data: {
      shareId: share.id,
      sharerId: invitingUserId,
      workspaceInviteId: workspaceInvite.id,
      accessLevel: UserAccessLevel.Use,
    },
  })

  const invitingUser = await prisma.user.findUniqueOrThrow({
    where: {
      id: invitingUserId,
    },
  })

  await sendShareNotificationEmail(invitingUser?.name, email, postId)

  return await getPostSharesService(prisma, uowContext, { postId })
}

const handleInvitedUserExists = async (
  prisma: PrismaTrxClient,
  invitingUserId: string,
  invitedUserId: string,
  uowContext: UserOnWorkspaceContext,
  postId: string,
) => {
  if (invitingUserId === invitedUserId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'You cannot invite yourself',
    })
  }
  const shareForInvitedUser = await prisma.share.findFirst({
    where: {
      postId,
      shareTargets: {
        some: {
          userId: invitedUserId,
        },
      },
    },
  })

  if (shareForInvitedUser) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: USER_ALREADY_INVITED_ERROR,
    })
  }

  const share = await getShare(prisma, postId)

  await prisma.shareTarget.create({
    data: {
      shareId: share.id,
      sharerId: invitingUserId,
      userId: invitedUserId,
      accessLevel: UserAccessLevel.Use,
    },
  })

  const [invitingUser, invitedUser] = await Promise.all([
    await prisma.user.findUniqueOrThrow({
      where: {
        id: invitingUserId,
      },
    }),
    await prisma.user.findUniqueOrThrow({
      where: {
        id: invitedUserId,
      },
    }),
  ])

  await sendShareNotificationEmail(
    invitingUser.name,
    invitedUser.email!,
    postId,
  )

  return await getPostSharesService(prisma, uowContext, { postId })
}

const getShare = async (prisma: PrismaTrxClient, postId: string) => {
  return await prisma.share.findFirstOrThrow({
    where: {
      postId,
    },
  })
}

const sendShareNotificationEmail = async (
  invitingUserName: string | null,
  invitedUserEmail: string,
  postId: string,
) => {
  const subject = `Your invitation to Joia`
  const postUrl = `${env.NEXT_PUBLIC_FRONTEND_URL}/p/${postId}`

  await sendEmail({
    fromName: 'Joia',
    to: invitedUserEmail,
    subject,
    body: getEmailBody(invitingUserName ?? '', postUrl),
  })
}

const getEmailBody = (invitingUserName: string, postUrl: string) => {
  let str = `Hello,
  `

  if (invitingUserName) {
    str += `
${invitingUserName} has shared access to a Chatbot in Joia with you.`
  } else {
    str += `
This is a message from Joia. You have been shared access to a chatbot.`
  }

  str += `

You can access the chatbot through the following link:
${postUrl}

If you do not have an account, you will be prompted to create one.

Thank you,
Joia`

  return str
}
