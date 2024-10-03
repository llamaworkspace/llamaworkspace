import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { startOfDay, subDays } from 'date-fns'
import { scopeChatByWorkspace } from '../chatUtils'

interface GetChatsPayload {
  appId?: string
  excludeEmpty?: boolean
}

export const getChatsService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload?: GetChatsPayload,
) => {
  const { userId, workspaceId } = uowContext
  const appId = payload?.appId
  const excludeEmpty = payload?.excludeEmpty

  return await prismaAsTrx(prisma, async (prisma) => {
    const messagesWhereFilter = excludeEmpty ? { messages: { some: {} } } : {}

    const date30DaysAgo = startOfDay(subDays(new Date(), 30))

    return await prisma.chat.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      where: scopeChatByWorkspace(
        {
          appId,
          authorId: userId, // Logic: user can see their own chats
          createdAt: {
            gte: date30DaysAgo,
          },
          app: {
            markAsDeletedAt: null,
          },
          ...messagesWhereFilter,
        },
        workspaceId,
      ),
      orderBy: {
        createdAt: 'desc',
      },
    })
  })
}
