import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopeChatByWorkspace } from '../chatUtils'

interface GetMessagesPayload {
  chatId: string
}

export const getMessagesByChatIdService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetMessagesPayload,
) {
  const { userId, workspaceId } = uowContext
  const { chatId } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    const chat = await prisma.chat.findFirstOrThrow({
      where: scopeChatByWorkspace(
        { id: chatId, authorId: userId },
        workspaceId,
      ),
    })

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      chat.appId,
    )

    return await prisma.message.findMany({
      where: {
        chatId,
        chat: scopeChatByWorkspace(
          { id: chatId, authorId: userId },
          workspaceId,
        ),
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  })
}
