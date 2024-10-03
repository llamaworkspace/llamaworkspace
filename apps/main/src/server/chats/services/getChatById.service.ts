import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Chat } from '@prisma/client'
import { scopeChatByWorkspace } from '../chatUtils'

interface GetMessagesPayload {
  chatId: string
  includeApp?: boolean
}

type ReturnType<T> = T extends { includeApp: true } ? Chat & { app: App } : Chat

export const getChatByIdService = async function <T extends GetMessagesPayload>(
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: T,
) {
  const { userId, workspaceId } = uowContext
  const { chatId, includeApp } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    const chat = await prisma.chat.findFirstOrThrow({
      where: scopeChatByWorkspace({ id: chatId }, workspaceId),
      include: includeApp ? { app: true } : undefined,
    })

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      chat.appId,
    )
    return chat as ReturnType<T>
  })
}
