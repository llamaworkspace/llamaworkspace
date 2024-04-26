import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
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
    await prismaAsTrx(prisma, async (prisma) => {
      const workspace = await createWorkspaceForUserService(prisma, userId)
      const context = await createUserOnWorkspaceContext(
        prisma,
        workspace.id,
        userId,
      )

      await setDefaultsForWorkspaceService(prisma, context)
      await addUserToWorkspaceService(prisma, context)
      await settlePostSharesForNewUserService(prisma, userId)
      await settleWorkspaceInvitesForNewUserService(prisma, context)
      await createDefaultsForNewUserService(prisma, context)
      await onboardingCreateService(prisma, context)
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
