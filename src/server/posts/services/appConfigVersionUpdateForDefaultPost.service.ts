import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { scopeChatByWorkspace } from '@/server/chats/chatUtils'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import {
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { TRPCError } from '@trpc/server'

interface AppConfigVersionUpdateForDefaultPostServiceInputProps {
  chatId: string
  model: string
}

export const appConfigVersionUpdateForDefaultPostService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: AppConfigVersionUpdateForDefaultPostServiceInputProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId, workspaceId } = uowContext
    const { chatId, model } = input

    const chat = await prisma.chat.findFirstOrThrow({
      where: scopeChatByWorkspace(
        {
          id: chatId,
        },
        workspaceId,
      ),
      include: {
        app: true,
      },
    })

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      chat.postId,
    )

    if (!chat.app.isDefault) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Only default posts can be updated',
      })
    }

    return await prisma.appConfigVersion.update({
      where: {
        id: chat.appConfigVersionId!,
      },
      data: {
        model,
      },
    })
  })
}
