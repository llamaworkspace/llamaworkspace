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

interface PostConfigVersionUpdateForDefaultPostServiceInputProps {
  chatId: string
  model: string
}

export const postConfigVersionUpdateForDefaultPostService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: PostConfigVersionUpdateForDefaultPostServiceInputProps,
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
        post: true,
      },
    })

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      chat.postId,
    )

    if (!chat.post.isDefault) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Only default posts can be updated',
      })
    }

    return await prisma.postConfigVersion.update({
      where: {
        id: chat.postConfigVersionId!,
      },
      data: {
        model,
      },
    })
  })
}
