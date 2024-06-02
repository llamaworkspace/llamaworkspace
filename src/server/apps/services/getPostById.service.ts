import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopePostByWorkspace } from '../postUtils'

interface GetPostByIdServiceInputProps {
  appId: string
}

export const getPostByIdService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetPostByIdServiceInputProps,
) => {
  const { userId, workspaceId } = uowContext
  const { appId } = payload

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    appId,
  )

  return await prisma.app.findFirstOrThrow({
    where: scopePostByWorkspace({ id: appId }, workspaceId),
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
