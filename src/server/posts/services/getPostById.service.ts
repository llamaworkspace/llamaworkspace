import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopePostByWorkspace } from '../postUtils'

interface GetPostByIdServiceInputProps {
  postId: string
}

export const getPostByIdService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetPostByIdServiceInputProps,
) => {
  const { userId, workspaceId } = uowContext
  const { postId } = payload

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    postId,
  )

  return await prisma.post.findFirstOrThrow({
    where: scopePostByWorkspace({ id: postId }, workspaceId),
    include: {
      chats: {
        select: { id: true, createdAt: true },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}
