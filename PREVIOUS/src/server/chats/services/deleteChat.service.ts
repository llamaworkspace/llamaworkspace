import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopeChatByWorkspace } from '../chatUtils'

interface DeleteChatPayload {
  id: string
}

export const deleteChatService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: DeleteChatPayload,
) {
  const { userId, workspaceId } = uowContext
  const { id } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    const chat = await prisma.chat.findFirstOrThrow({
      where: scopeChatByWorkspace(
        {
          id,
        },
        workspaceId,
      ),
    })

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      chat.postId,
    )

    return await prisma.chat.delete({
      where: {
        id,
      },
    })
  })
}
