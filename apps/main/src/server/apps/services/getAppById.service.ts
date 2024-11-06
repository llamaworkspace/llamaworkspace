import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Prisma } from '@prisma/client'
import { scopeAppByWorkspace } from '../appUtils'

interface GetAppByIdServiceInputProps {
  appId: string
  showMarkedAsDeleted?: boolean
}

export const getAppByIdService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetAppByIdServiceInputProps,
) => {
  const { userId, workspaceId } = uowContext
  const { appId, showMarkedAsDeleted = false } = payload

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    appId,
  )

  const whereClause: Prisma.AppWhereInput = {
    id: appId,
  }
  if (!showMarkedAsDeleted) {
    whereClause.markAsDeletedAt = null
  }

  return await prisma.app.findFirstOrThrow({
    where: scopeAppByWorkspace(whereClause, workspaceId),
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
