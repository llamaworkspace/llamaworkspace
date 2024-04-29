import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { createDefaultsForNewUserService } from '@/server/users/services/createDefaultsForNewUser.service'
import { createWorkspaceForUserService } from '@/server/users/services/createWorkspaceForUser.service'
import type { PrismaClient } from '@prisma/client'

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

      // This should go on invite flow success, and not happen here.
      // await addUserToWorkspaceService(prisma, context, {
      //   invitedUserId: userId,
      // })

      // This should go only on handle flow success, and be modified to act as it should "addUserToWorkspaceService", and happen always
      // await settleWorkspaceInvitesForNewUserServiceUPDATEME(prisma, context)
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
