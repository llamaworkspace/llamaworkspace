import { env } from '@/env.mjs'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { sendEmail } from '@/server/messaging/mailer'
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
import { getAppSharesService } from './getAppShares.service'

const USER_ALREADY_INVITED_ERROR = 'You have already invited this user'

interface PerformAppShareInputPayload {
  email: string
  appId: string
}

export const performAppShareService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: PerformAppShareInputPayload,
) => {
  const { userId: invitingUserId } = uowContext
  const { email, appId } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Invite,
      invitingUserId,
      appId,
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
        appId,
      )
    }

    return await handleInvitedUserExists(
      prisma,
      invitingUserId,
      invitedUser.id,
      uowContext,
      appId,
    )
  })
}

const handleInvitedUserDoesNotExist = async (
  prisma: PrismaTrxClient,
  uowContext: UserOnWorkspaceContext,
  email: string,
  appId: string,
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
      appId,
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

  const share = await getShare(prisma, appId)

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
    appId,
    userExistsInDb: false,
    token: workspaceInvite.token,
  })

  return await getAppSharesService(prisma, uowContext, { appId })
}

const handleInvitedUserExists = async (
  prisma: PrismaTrxClient,
  invitingUserId: string,
  invitedUserId: string,
  uowContext: UserOnWorkspaceContext,
  appId: string,
) => {
  if (invitingUserId === invitedUserId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'You cannot invite yourself',
    })
  }
  const shareForInvitedUser = await prisma.share.findFirst({
    where: {
      appId,
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

  const share = await getShare(prisma, appId)

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
    appId,
    userExistsInDb: true,
  })

  return await getAppSharesService(prisma, uowContext, { appId })
}

const getShare = async (prisma: PrismaTrxClient, appId: string) => {
  return await prisma.share.findFirstOrThrow({
    where: {
      appId,
    },
  })
}

interface SendShareNotificationEmailPayload {
  invitingUserEmail: string
  invitingUserName: string | null
  invitedUserEmail: string
  appId: string
  userExistsInDb: boolean
  token?: string
}

const sendShareNotificationEmail = async (
  prisma: PrismaTrxClient,
  {
    invitingUserEmail,
    invitingUserName,
    invitedUserEmail,
    appId,
    userExistsInDb,
    token,
  }: SendShareNotificationEmailPayload,
) => {
  const app = await prisma.app.findUniqueOrThrow({
    where: {
      id: appId,
    },
    select: {
      title: true,
    },
  })

  const invitingUserNameOrEmail = invitingUserName ?? invitingUserEmail
  const subject = `${invitingUserNameOrEmail} has shared you access to a GPT`
  const appUrl = userExistsInDb && `${env.NEXT_PUBLIC_FRONTEND_URL}/p/${appId}`
  const workspaceInviteUrl =
    !userExistsInDb && `${env.NEXT_PUBLIC_FRONTEND_URL}/invite/${token}`

  await sendEmail({
    fromName: 'Joia',
    to: invitedUserEmail,
    subject,
    text: getEmailBody(
      invitingUserName ?? 'A colleague',
      invitingUserEmail,
      app.title ?? 'Untitled GPT',
      appUrl || undefined,
      workspaceInviteUrl || undefined,
    ),
  })
}

const getEmailBody = (
  invitingUserName: string,
  email: string,
  appName: string,
  appUrl?: string,
  workspaceUrl?: string,
) => {
  if (!appUrl && !workspaceUrl) {
    throw new Error('appUrl or workspaceUrl must be provided')
  }

  let str = `Hello,

${invitingUserName} has invited you to use the following GPT at Joia: ${appName}.

`
  if (appUrl) {
    str += `To access the GPT, please follow this link:
${appUrl}

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
