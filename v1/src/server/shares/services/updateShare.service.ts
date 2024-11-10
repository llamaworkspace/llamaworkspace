import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient, ShareScope } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopeShareByWorkspace } from '../shareUtils'

interface UpdateShareAccessLevelPayload {
  shareId: string
  scope: ShareScope
}

export const updateShareService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: UpdateShareAccessLevelPayload,
) => {
  const { workspaceId, userId } = uowContext
  const { shareId, ...rest } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    const share = await prisma.share.findFirstOrThrow({
      where: scopeShareByWorkspace(
        {
          id: shareId,
        },
        workspaceId,
      ),
    })

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Invite,
      userId,
      share.appId,
    )

    return await prisma.share.update({
      where: {
        id: shareId,
      },
      data: rest,
    })
  })
}
