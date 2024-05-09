import { workspaceEditionFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { env } from '@/env.mjs'
import { generateToken } from '@/lib/utils'
import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { sendEmail } from '@/server/mailer/mailer'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { TRPCError } from '@trpc/server'
import { WorkspaceInviteSources } from '../workspaceTypes'

export const inviteToWorkspaceService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  invitedUserEmail: string,
  disableInvitationEmail = false,
  source: WorkspaceInviteSources = WorkspaceInviteSources.Direct,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { workspaceId, userId: invitingUserId } = uowContext
    const workspace = await prisma.workspace.findUniqueOrThrow({
      select: {
        id: true,
        name: true,
      },
      where: {
        id: workspaceId,
        ...workspaceEditionFilter(invitingUserId),
      },
    })

    const invitedUser = await prisma.user.findUnique({
      select: {
        id: true,
      },
      where: {
        email: invitedUserEmail,
      },
    })

    if (invitedUser) {
      await handleUserExists(prisma, uowContext, invitedUser.id)
      return null
    }
    return await handleUserDoesNotExist(
      prisma,
      workspace.id,
      invitingUserId,
      invitedUserEmail,
      disableInvitationEmail,
      source,
    )
  })
}

const handleUserExists = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  invitedUserId: string,
) => {
  const { userId: invitingUserId, workspaceId } = uowContext
  if (invitingUserId === invitedUserId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'You cannot invite yourself',
    })
  }

  const existingMembership = await prisma.usersOnWorkspaces.findUnique({
    where: {
      userId_workspaceId: {
        userId: invitedUserId,
        workspaceId,
      },
    },
  })

  if (existingMembership) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'The user is already a member of this workspace',
    })
  }

  throw new TRPCError({
    code: 'BAD_REQUEST',
    message:
      'This person cannot be invited because they already have an account with us.',
  })
}

const handleUserDoesNotExist = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  invitingUserId: string,
  invitedUserEmail: string,
  disableInvitationEmail: boolean,
  source: WorkspaceInviteSources,
) => {
  const existingInvite = await prisma.workspaceInvite.findUnique({
    select: {
      id: true,
    },
    where: {
      email_workspaceId: {
        email: invitedUserEmail,
        workspaceId: workspaceId,
      },
    },
  })

  if (!!existingInvite) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message:
        'The user has already been invited to the workspace but has not yet accepted the invitation.',
    })
  }

  const [invitingUser, workspace] = await Promise.all([
    await prisma.user.findUniqueOrThrow({
      select: {
        email: true,
        name: true,
      },
      where: {
        id: invitingUserId,
      },
    }),
    await prisma.workspace.findUniqueOrThrow({
      select: {
        name: true,
      },
      where: {
        id: workspaceId,
      },
    }),
  ])

  const invite = await prisma.workspaceInvite.create({
    data: {
      invitedById: invitingUserId,
      email: invitedUserEmail,
      token: generateToken(64),
      workspaceId: workspaceId,
      source,
    },
  })

  const invitingUserOrEmail = invitingUser.name ?? invitingUser.email!

  if (!disableInvitationEmail) {
    await sendEmailToInvitedUser({
      workspaceId,
      invitingUserName: invitingUserOrEmail,
      invitedUserEmail,
      workspaceName: workspace.name,
      token: invite.token,
    })
  }

  return invite
}

interface SendEmailToInvitedUserParams {
  workspaceId: string
  invitingUserName: string
  invitedUserEmail: string
  workspaceName: string
  token: string
}

const sendEmailToInvitedUser = async (params: SendEmailToInvitedUserParams) => {
  const { invitingUserName, invitedUserEmail, workspaceName, token } = params

  const fromName = invitingUserName ? `${invitingUserName} - via Joia` : 'Joia'

  const subject = `Your invitation to the workspace "${workspaceName}"`

  const workspaceUrl = `${env.NEXT_PUBLIC_FRONTEND_URL}/invite/${token}`

  await sendEmail({
    fromName,
    to: invitedUserEmail,
    subject,
    body: getEmailBody(
      invitingUserName,
      workspaceUrl,
      workspaceName,
      invitedUserEmail,
    ),
  })
}

const getEmailBody = (
  inviteeName: string,
  workspaceUrl: string,
  workspaceName: string,
  email: string,
) => {
  return `Hello,

${inviteeName} has invited you to the following workspace at Joia: ${workspaceName}.

To enter the workspace, please click on the following link:
${workspaceUrl}

If you do not have an account, you will be prompted to create one. You must use the following email address to create your account, otherwise the invitation won't work:
${email}

Reach out to us by replying to this email if you have any doubts or trouble signing up.

All the best,
The Joia team`
}
