import { TRPCError } from '@trpc/server'
import Promise from 'bluebird'
import { prismaAsTrx } from 'server/lib/prismaAsTrx'
import { addUserToWorkspaceService } from 'server/workspaces/services/addUserToWorkspace.service'
import { deleteWorkspaceService } from 'server/workspaces/services/deleteWorkspace.service'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from 'shared/globalTypes'

export const inviteSuccessOrchestrationService = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  inviteToken: string,
) => {
  return prismaAsTrx(prisma, async (prisma) => {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: userId,
      },
    })

    if (!user.email) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User does not have an email.',
      })
    }
    const invite = await getWorkspaceInvite(prisma, inviteToken, user.email)

    if (!invite) {
      return
    }

    // Delete the initial workspace for the user
    await deleteDefaultWorkspaceForUser(prisma, userId)

    // Add user to the invited workspace
    await addUserToWorkspaceService(prisma, {
      userId: userId,
      workspaceId: invite.workspaceId,
    })

    // Clear invites
    await removeUsedInvite(prisma, user.email)
  })
}

const deleteDefaultWorkspaceForUser = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      workspaces: true,
    },
  })

  const usersOnWorkspaces = user.workspaces

  if (!usersOnWorkspaces.length) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'User does not have any workspaces.',
    })
  }

  await Promise.map(usersOnWorkspaces, async (userOnWorkspace) => {
    const usersInWorkspaceCount = await prisma.usersOnWorkspaces.count({
      where: {
        workspaceId: userOnWorkspace.workspaceId,
      },
    })

    if (usersInWorkspaceCount > 1) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Cannot delete workspace with more than one user.',
      })
    }
    await deleteWorkspaceService(prisma, userOnWorkspace.workspaceId)
  })
}

const getWorkspaceInvite = async (
  prisma: PrismaTrxClient,
  inviteToken: string,
  email: string,
) => {
  return await prisma.workspaceInvite.findFirst({
    where: {
      token: inviteToken,
      email,
    },
  })
}

const removeUsedInvite = async (
  prisma: PrismaTrxClient,
  invitedUserEmail: string,
) => {
  await prisma.workspaceInvite.deleteMany({
    where: {
      email: invitedUserEmail,
    },
  })
}
