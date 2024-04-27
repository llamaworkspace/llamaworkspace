import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { workspaceOnboardingCreationService } from '@/server/onboarding/services/workspaceOnboardingCreation.service'
import { createDefaultsForNewUserService } from '@/server/users/services/createDefaultsForNewUser.service'
import { createWorkspaceForUserService } from '@/server/users/services/createWorkspaceForUser.service'
import { settleWorkspaceInvitesForNewUserService as settleWorkspaceInvitesForNewUserServiceUPDATEME } from '@/server/users/services/settleWorkspaceInvitesForNewUser.service'
import { addUserToWorkspaceService } from '@/server/workspaces/services/addUserToWorkspace.service'
import { setDefaultsForWorkspaceService } from '@/server/workspaces/services/setDefaultsForWorkspace.service'
import type { PrismaClient } from '@prisma/client'

export const handleUserSignup = async (
  prisma: PrismaClient,
  userId: string,
) => {
  try {
    await prismaAsTrx(prisma, async (prisma) => {
      // Workspace setup start
      const workspace = await createWorkspaceForUserService(prisma, userId)
      await setDefaultsForWorkspaceService(prisma, workspace.id)
      await createDefaultsForNewUserService(prisma, userId)
      // Workspace setup end

      const context = await createUserOnWorkspaceContext(
        prisma,
        workspace.id,
        userId,
      )

      await addUserToWorkspaceService(prisma, context, {
        invitedUserId: userId,
      })

      // await settlePostSharesForNewUserService(prisma, userId)
      await settleWorkspaceInvitesForNewUserServiceUPDATEME(prisma, context)
      await workspaceOnboardingCreationService(prisma, context)
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
