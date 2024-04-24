import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { scopeChatByWorkspace } from '../chatUtils'

interface GetChatsPayload {
  postId?: string
  excludeEmpty?: boolean
}

export const getChatsService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload?: GetChatsPayload,
) => {
  const { userId, workspaceId } = uowContext
  const postId = payload?.postId
  const excludeEmpty = payload?.excludeEmpty

  return await prismaAsTrx(prisma, async (prisma) => {
    // TODO: Re-implement permissions
    // await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
    //   PermissionAction.View,
    //   userId,
    //   postId,
    // )

    const messagesWhereFilter = excludeEmpty ? { messages: { some: {} } } : {}

    return await prisma.chat.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      where: scopeChatByWorkspace(
        {
          postId,
          authorId: userId, // Logic: user can see their own chats
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
