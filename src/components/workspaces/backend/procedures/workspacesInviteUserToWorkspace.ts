import { env } from '@/env.mjs'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { sendEmail } from '@/server/mailer/mailer'
import { protectedProcedure } from '@/server/trpc/trpc'
import { addUserToWorkspaceService } from '@/server/workspaces/services/addUserToWorkspace.service'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { workspaceEditionFilter } from '../workspacesBackendUtils'

const zInput = z.object({
  workspaceId: z.string(),
  email: z.string(),
})

export const workspacesInviteUserToWorkspace = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    await prismaAsTrx(ctx.prisma, async (prisma) => {
      const workspace = await prisma.workspace.findUniqueOrThrow({
        select: {
          id: true,
          name: true,
        },
        where: {
          id: input.workspaceId,
          ...workspaceEditionFilter(userId),
        },
      })

      const existingUser = await prisma.user.findUnique({
        select: {
          id: true,
        },
        where: {
          email: input.email,
        },
      })

      if (existingUser) {
        await handleExistingUser(prisma, workspace.id, existingUser.id)
      } else {
        await handleInexistentUser(
          prisma,
          userId,
          workspace.id,
          input.email,
          workspace.name,
        )
      }
    })
  })

const handleExistingUser = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  existingUserId: string,
) => {
  const result = await addUserToWorkspaceService(
    prisma,
    existingUserId,
    workspaceId,
  )

  if (!result) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'The user is already a member of this workspace',
    })
  }

  const user = await prisma.user.findUniqueOrThrow({
    select: {
      email: true,
    },
    where: {
      id: existingUserId,
    },
  })

  const workspace = await prisma.workspace.findUniqueOrThrow({
    select: {
      name: true,
    },
    where: {
      id: workspaceId,
    },
  })

  if (!user.email) return

  await sendEmailToInvitedUser(
    prisma,
    existingUserId,
    user.email,
    workspaceId,
    workspace.name,
  )
}

const handleInexistentUser = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  workspaceId: string,
  email: string,
  workspaceName: string,
) => {
  const existingInvite = await prisma.workspaceInvite.findUnique({
    select: {
      id: true,
    },
    where: {
      email_workspaceId: {
        email: email,
        workspaceId: workspaceId,
      },
    },
  })

  if (!!existingInvite) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message:
        'The user is already invited to the workspace, but has not yet accepted the invitation.',
    })
  }

  await prisma.workspaceInvite.create({
    data: {
      invitedById: userId,
      email: email,
      workspaceId: workspaceId,
    },
  })

  await sendEmailToInvitedUser(
    prisma,
    userId,
    email,
    workspaceId,
    workspaceName,
  )
}

const sendEmailToInvitedUser = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  email: string,
  workspaceId: string,
  workspaceName: string,
) => {
  const invitingUser = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  })

  const fromName = invitingUser?.name
    ? `${invitingUser.name} - via Joia`
    : 'Joia'

  const subject = `Your invitation to the workspace "${workspaceName}"`

  const workspaceUrl = `${env.FRONTEND_URL}/w/${workspaceId}`
  const invitingUserOrEmail = invitingUser.name! && invitingUser.email!

  await sendEmail({
    fromName,
    to: email,
    subject,
    body: getEmailBody(invitingUserOrEmail, workspaceUrl, workspaceName, email),
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
