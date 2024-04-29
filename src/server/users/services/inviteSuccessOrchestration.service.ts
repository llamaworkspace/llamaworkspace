import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { addUserToWorkspaceService } from '@/server/workspaces/services/addUserToWorkspace.service'
import { deleteWorkspaceService } from '@/server/workspaces/services/deleteWorkspace.service'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import { TRPCError } from '@trpc/server'
import Promise from 'bluebird'

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

    // Add user to the workspace...
    // 1. Find the target workspace
    // 2. Add the user to the workspace
    const context = await createUserOnWorkspaceContext(
      prisma,
      invite.workspaceId,
      userId,
    )
    await addUserToWorkspaceService(prisma, context, { invitedUserId: userId })

    // Dnd me he quedado:

    await removeUsedInvite(prisma, user.email)
    // - Falta ejecutar correctament el settleWs
    // settleWorkspaceInvitesForNewUserService; whatever that means now

    return 'ok'
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
    await deleteWorkspaceService(prisma, userOnWorkspace.id)
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
