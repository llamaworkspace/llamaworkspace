import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const getUserWorkspacesService = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
) => {
  return await prisma.workspace.findMany({
    select: { id: true, name: true, onboardingCompletedAt: true },
    where: { users: { some: { userId } } },
  })
}
