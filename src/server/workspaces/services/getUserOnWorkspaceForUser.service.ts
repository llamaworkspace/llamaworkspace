import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

interface GetUserOnWorkspaceForUser {
  userId: string
}

export const getUserOnWorkspaceForUserService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetUserOnWorkspaceForUser,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { workspaceId } = uowContext
    const { userId: targetUserId } = payload

    return await prisma.usersOnWorkspaces.findUniqueOrThrow({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId,
        },
      },
    })
  })
}
