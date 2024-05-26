import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { workspaceOnboardingCreationService } from '@/server/onboarding/services/workspaceOnboardingCreation.service'
import { setDefaultsForWorkspaceService } from '@/server/workspaces/services/setDefaultsForWorkspace.service'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

const buildName = (name?: string | null) => {
  return name ? name.split(' ')[0] + "'s Workspace" : 'My Workspace'
}

export const createWorkspaceForUserService = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    const workspace = await prisma.workspace.create({
      data: {
        name: buildName(user?.name),
        users: {
          create: [
            {
              userId,
            },
          ],
        },
      },
    })

    // Side effects
    const context = await createUserOnWorkspaceContext(
      prisma,
      workspace.id,
      userId,
    )
    await setDefaultsForWorkspaceService(prisma, workspace.id)
    await workspaceOnboardingCreationService(prisma, context)

    return workspace
  })
}
