import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { addUserToWorkspaceService } from '@/server/workspaces/services/addUserToWorkspace.service'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const createDefaultsForNewUserService = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    await addUserToWorkspaceService(prisma, userId, workspaceId)
  })
}
