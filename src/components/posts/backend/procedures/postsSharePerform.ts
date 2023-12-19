import { env } from '@/env.mjs'
import { generateToken } from '@/lib/utils'
import { sendEmail } from '@/server/mailer/mailer'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { UserAccessLevel } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { PrismaClient, User } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const zInput = z.object({
  postId: z.string(),
  email: z.string().email(),
})

export const postsSharePerform = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const invitingUserId = ctx.session.user.id

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.Share,
      invitingUserId,
      input.postId,
    )

    const invitedUser = await ctx.prisma.user.findFirst({
      where: {
        email: input.email,
      },
    })

    if (!invitedUser) {
      await handleInvitedUserDoesNotExist({
        prisma: ctx.prisma,
        invitingUserId,
        invitedUserEmail: input.email,
        postId: input.postId,
      })
    } else if (invitedUser.id === invitingUserId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You cannot invite yourself',
      })
    } else {
      await handleInvitedUserExists({
        prisma: ctx.prisma,
        invitingUserId,
        invitedUser,
        postId: input.postId,
      })
    }

    return { success: true }
  })

interface IHandleInvitedUserDoesNotExist {
  prisma: PrismaClient
  invitingUserId: string
  invitedUserEmail: string
  postId: string
}

const handleInvitedUserDoesNotExist = async ({
  prisma,
  invitingUserId,
  postId,
  invitedUserEmail,
}: IHandleInvitedUserDoesNotExist) => {
  // Does this user have a pending invitation?

  const existingInvite = await prisma.invite.findFirst({
    where: {
      email: invitedUserEmail,
      completedAt: null,
      invitedById: invitingUserId,
      postShare: {
        postId,
      },
    },
  })

  if (existingInvite) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'You have already invited this user',
    })
  } else {
  }

  const [invite, postShare] = await prisma.$transaction(async (prisma) => {
    const invite = await prisma.invite.create({
      data: {
        email: invitedUserEmail,
        invitedById: invitingUserId,
        token: generateToken(64),
      },
    })

    const postShare = await prisma.postShare.create({
      data: {
        postId,
        accessLevel: UserAccessLevel.Use,
        inviteId: invite.id,
      },
    })

    return [invite, postShare]
  })

  const invitingUser = await prisma.user.findUniqueOrThrow({
    where: {
      id: invitingUserId,
    },
  })

  const post = await prisma.post.findUniqueOrThrow({
    where: {
      isDefault: false,
      id: postId,
    },
  })

  const fromName = invitingUser?.name
    ? `${invitingUser.name} (via Joia)`
    : 'Joia'

  const subject = post.title
    ? `You have been invited to "${post.title}"`
    : 'You have been invited to join Joia'

  const postUrl = `${env.NEXT_PUBLIC_FRONTEND_URL}/invite/${invite.token}`
  const invitingUserOrEmail = invitingUser.name! && invitingUser.email!

  await sendEmail({
    fromName,
    to: invitedUserEmail,
    subject,
    body: getEmailBody(invitingUserOrEmail, postUrl, post.title),
  })

  return [invite, postShare]
}

interface IHandleInvitedUserExists {
  prisma: PrismaClient
  invitingUserId: string
  invitedUser: User
  postId: string
}

const handleInvitedUserExists = async ({
  prisma,
  invitingUserId,
  postId,
  invitedUser,
}: IHandleInvitedUserExists) => {
  const existingInvitation = await prisma.postShare.findFirst({
    where: {
      userId: invitedUser.id,
      postId,
      post: {
        userId: invitingUserId,
      },
    },
  })

  if (existingInvitation) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'You have already invited this user',
    })
  }

  await prisma.postShare.create({
    data: {
      postId,
      userId: invitedUser.id,
      accessLevel: UserAccessLevel.Use,
    },
  })

  return { success: true }
}

const getEmailBody = (
  inviteeName: string,
  postUrl: string,
  postName?: string | null,
) => {
  let str = `Hello,

  `

  if (postName) {
    str += `${inviteeName} has shared with you the following post for Joia, the AI app: ${postName}.`
  } else {
    str += `${inviteeName} has shared with you a post in Joia, the AI app.`
  }

  str += `

  To view the post, please click on the following link:
  ${postUrl}

  If you do not have an account, you will be prompted to create one.

  Thank you,
  Joia the AI app`

  return str
}
