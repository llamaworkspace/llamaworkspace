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

interface PerformPostShareInputPayload {
  email: string
  postId: string
}

export const performPostShareService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: PerformPostShareInputPayload,
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

  await sendShareNotificationEmail(prisma, {
    invitingUserEmail: invitingUser.email!,
    invitingUserName: invitingUser.name,
    invitedUserEmail: email,
    postId,
    userExistsInDb: false,
    token: workspaceInvite.token,
  })

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

  await sendShareNotificationEmail(prisma, {
    invitingUserEmail: invitingUser.email!,
    invitingUserName: invitingUser.name,
    invitedUserEmail: invitedUser.email!,
    postId,
    userExistsInDb: true,
  })

  return await getPostSharesService(prisma, uowContext, { postId })
}

const getShare = async (prisma: PrismaTrxClient, postId: string) => {
  return await prisma.share.findFirstOrThrow({
    where: {
      postId,
    },
  })
}

interface SendShareNotificationEmailPayload {
  invitingUserEmail: string
  invitingUserName: string | null
  invitedUserEmail: string
  postId: string
  userExistsInDb: boolean
  token?: string
}

const sendShareNotificationEmail = async (
  prisma: PrismaTrxClient,
  {
    invitingUserEmail,
    invitingUserName,
    invitedUserEmail,
    postId,
    userExistsInDb,
    token,
  }: SendShareNotificationEmailPayload,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      title: true,
    },
  })

  const invitingUserNameOrEmail = invitingUserName ?? invitingUserEmail
  const subject = `${invitingUserNameOrEmail} has shared you access to a GPT`
  const postUrl =
    userExistsInDb && `${env.NEXT_PUBLIC_FRONTEND_URL}/p/${postId}`
  const workspaceInviteUrl =
    !userExistsInDb && `${env.NEXT_PUBLIC_FRONTEND_URL}/invite/${token}`

  await sendEmail({
    fromName: 'Joia',
    to: invitedUserEmail,
    subject,
    body: getEmailBody(
      invitingUserName ?? 'A colleague',
      invitingUserEmail,
      post.title ?? 'Untitled GPT',
      postUrl || undefined,
      workspaceInviteUrl || undefined,
    ),
  })
}

const getEmailBody = (
  invitingUserName: string,
  email: string,
  postName: string,
  postUrl?: string,
  workspaceUrl?: string,
) => {
  if (!postUrl && !workspaceUrl) {
    throw new Error('postUrl or workspaceUrl must be provided')
  }

  let str = `Hello,

${invitingUserName} has invited you to use the following GPT at Joia: ${postName}.

`
  if (postUrl) {
    str += `To access the GPT, please follow this link:
${postUrl}

`
  }
  if (workspaceUrl) {
    str += `Since you do not have an account with us, you will need to create one first. To do so, please click on the following link:
${workspaceUrl}

You must use the email "${email}" to create your account; otherwise the invitation won't work.

`
  }

  str += `If you have any doubts or trouble signing up, please do not hesitate to reach out to us by replying to this email.

All the best,
The Joia team`

  return str
}
