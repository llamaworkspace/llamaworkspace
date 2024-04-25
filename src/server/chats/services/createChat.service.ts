import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { updatePostSortingV2Service } from '@/server/posts/services/updatePostSortingV2.service'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'

interface CreateChatPayload {
  postId: string
}

export const createChatService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: CreateChatPayload,
) {
  const { userId } = uowContext
  const { postId } = payload

  await new PermissionsVerifier(prisma).callOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    postId,
  )

  return await prismaAsTrx(prisma, async (prisma) => {
    const chat = await prisma.chat.create({
      data: {
        postId,
        authorId: userId,
      },
    })
    await updatePostSortingV2Service(prisma, uowContext, postId)

    return chat
  })
}
