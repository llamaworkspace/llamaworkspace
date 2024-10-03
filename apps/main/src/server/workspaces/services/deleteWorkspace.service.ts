import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const deleteWorkspaceService = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    return prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    })
  })
}
