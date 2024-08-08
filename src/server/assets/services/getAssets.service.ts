import { AssetUploadStatus } from '@/components/assets/assetTypes'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Prisma } from '@prisma/client'
import { scopeAssetByWorkspace } from '../assetUtils'

interface GetAppFilesPayload {
  appId?: string
}

export async function getAssetsService(
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetAppFilesPayload,
) {
  const { appId } = payload
  const { userId, workspaceId } = uowContext

  if (appId) {
    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      appId,
    )
  }

  const baseWhere: Prisma.AssetWhereInput = {
    uploadStatus: AssetUploadStatus.Success,
  }

  if (appId) {
    baseWhere.assetsOnApps = {
      some: {
        appId,
        markAsDeletedAt: null,
      },
    }
  }

  return await prisma.asset.findMany({
    where: scopeAssetByWorkspace(baseWhere, workspaceId),
    include: {
      assetsOnApps: true,
    },
  })
}
