import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { isNull } from 'underscore'
import { scopeChatByWorkspace } from '../chatUtils'

interface GetMessagesPayload {
  chatId: string
}

const EMPTY_RESPONSE_MESSAGE = '*Empty response*'

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

    const res = await prisma.message.findMany({
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

    return res.map((r) => {
      return {
        ...r,
        message: isNull(r.message) ? EMPTY_RESPONSE_MESSAGE : r.message,
      }
    })
  })
}
