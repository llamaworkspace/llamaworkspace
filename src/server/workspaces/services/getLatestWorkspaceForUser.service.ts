import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const getLatestWorkspaceForUserService = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
) => {
  const chatRun = await prisma.chatRun.findFirst({
    where: {
      chat: {
        authorId: userId,
      },
    },
    include: {
      chat: {
        select: {
          app: {
            select: {
              workspaceId: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!chatRun) {
    return await prisma.workspace.findFirstOrThrow({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  return await prisma.workspace.findFirstOrThrow({
    where: {
      id: chatRun.chat.app.workspaceId,
    },
  })
}
