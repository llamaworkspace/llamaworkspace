import type { UserOnWorkspaceContext } from 'server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from 'server/lib/prismaAsTrx'
import { PermissionsVerifier } from 'server/permissions/PermissionsVerifier'
import { Author } from 'shared/aiTypesAndMappers'
import type { PrismaClientOrTrxClient } from 'shared/globalTypes'
import { PermissionAction } from 'shared/permissions/permissionDefinitions'
import { scopeChatByWorkspace } from '../chatUtils'

interface CreateMessagePayload {
  chatId: string
  author: Author
  message?: string
}

export const createMessageService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: CreateMessagePayload,
) {
  const { userId, workspaceId } = uowContext
  const { chatId, author } = payload
  let { message } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    const chat = await prisma.chat.findFirstOrThrow({
      where: scopeChatByWorkspace({ id: chatId }, workspaceId),
    })

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      chat.postId,
    )

    if (author === Author.Assistant && message) {
      message = undefined
    }

    return await prisma.message.create({
      data: {
        chatId,
        message,
        author,
      },
    })
  })
}
