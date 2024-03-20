import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const getLatestWorkspaceForUser = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
) => {
  return await prisma.workspace.findFirstOrThrow({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}
