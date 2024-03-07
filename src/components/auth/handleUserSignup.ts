import { onboardingCreateService } from '@/server/onboarding/services/onboardingCreate.service'
import { createDefaultsForNewUserService } from '@/server/users/services/createDefaultsForNewUser.service'
import { createWorkspaceForUserService } from '@/server/users/services/createWorkspaceForUser.service'
import { settlePostSharesForNewUserService } from '@/server/users/services/settlePostSharesForNewUser.service'
import { settleWorkspaceInvitesForNewUserService } from '@/server/users/services/settleWorkspaceInvitesForNewUser.service'
import { addUserToWorkspaceService } from '@/server/workspaces/services/addUserToWorkspace.service'
import { setDefaultsForWorkspaceService } from '@/server/workspaces/services/setDefaultsForWorkspace.service'
import type { PrismaClient } from '@prisma/client'

export const handleUserSignup = async (
  prisma: PrismaClient,
  userId: string,
) => {
  try {
    await prisma.$transaction(async (prisma) => {
      const workspace = await createWorkspaceForUserService(prisma, userId)
      await setDefaultsForWorkspaceService(prisma, workspace.id)
      await addUserToWorkspaceService(prisma, userId, workspace.id)
      await settlePostSharesForNewUserService(prisma, userId)
      await settleWorkspaceInvitesForNewUserService(prisma, userId)
      await createDefaultsForNewUserService(prisma, workspace.id, userId)
      await onboardingCreateService(prisma, workspace.id, userId)
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
