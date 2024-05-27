import type { PrismaClient } from '@prisma/client'
import { prismaAsTrx } from 'server/lib/prismaAsTrx'
import { createDefaultsForNewUserService } from 'server/users/services/createDefaultsForNewUser.service'
import { createWorkspaceForUserService } from 'server/users/services/createWorkspaceForUser.service'

export const handleUserSignup = async (
  prisma: PrismaClient,
  userId: string,
) => {
  try {
    await prismaAsTrx(prisma, async (prisma) => {
      // User setup
      await createDefaultsForNewUserService(prisma, userId)
      // Workspace setup
      await createWorkspaceForUserService(prisma, userId)
    })
  } catch (error) {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    })
    throw error
  }
}
