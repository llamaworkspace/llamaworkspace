import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
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

    return await prisma.workspace.create({
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
  })
}
