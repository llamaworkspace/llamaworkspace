import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { createDefaultPostService } from '@/server/posts/services/createDefaultPost.service'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const addUserToWorkspaceService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { workspaceId, userId } = uowContext
    const existingMembership = await prisma.usersOnWorkspaces.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    })

    if (!!existingMembership) {
      return false
    }

    await prisma.usersOnWorkspaces.create({
      data: {
        userId,
        workspaceId,
      },
    })

    await createDefaultPostService(prisma, uowContext)
    return true
  })
}
