import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { deleteWorkspaceService } from '@/server/workspaces/services/deleteWorkspace.service'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { TRPCError } from '@trpc/server'
import Promise from 'bluebird'

export const inviteSuccessOrchestrationService = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
) => {
  return prismaAsTrx(prisma, async (prisma) => {
    // Delete the initial workspace for the user
    await deleteDefaultWorkspaceForUser(prisma, userId)

    // addUserToWorkspaceService
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
