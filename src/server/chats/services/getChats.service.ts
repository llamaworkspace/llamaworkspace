import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { scopeChatByWorkspace } from '../chatUtils'

interface GetChatsPayload {
  postId: string
}

export const getChatsService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetChatsPayload,
) => {
  const { userId, workspaceId } = uowContext
  const { postId } = payload
  return await prismaAsTrx(prisma, async (prisma) => {
    // TODO: Re-implement permissions
    // await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
    //   PermissionAction.View,
    //   userId,
    //   postId,
    // )

    return await prisma.chat.findMany({
      select: {
        id: true,
        title: true,
      },
      where: scopeChatByWorkspace(
        {
          postId,
          authorId: userId, // Logic: user can see their own chats
        },
        workspaceId,
      ),
      orderBy: {
        createdAt: 'desc',
      },
    })
  })
}
