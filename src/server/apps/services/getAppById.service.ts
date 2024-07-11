import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopeAppByWorkspace } from '../appUtils'

interface GetAppByIdServiceInputProps {
  appId: string
}

export const getAppByIdService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetAppByIdServiceInputProps,
) => {
  const { userId, workspaceId } = uowContext
  const { appId } = payload

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    appId,
  )

  return await prisma.app.findFirstOrThrow({
    where: scopeAppByWorkspace(
      { id: appId, markAsDeletedAt: null },
      workspaceId,
    ),
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
