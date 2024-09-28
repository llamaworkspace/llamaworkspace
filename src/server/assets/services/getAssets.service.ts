import { AssetUploadStatus } from '@/components/assets/assetTypes'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopeAssetByWorkspace } from '../assetUtils'

interface GetAppFilesPayload {
  appId: string
}

export async function getAssetsService(
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetAppFilesPayload,
) {
  const { appId } = payload
  const { userId, workspaceId } = uowContext

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    appId,
  )

  const assetsOnAppsFilter = {
    appId,
    markAsDeletedAt: null,
  }

  return await prisma.asset.findMany({
    where: scopeAssetByWorkspace(
      {
        uploadStatus: AssetUploadStatus.Success,
        assetsOnApps: {
          some: assetsOnAppsFilter,
        },
      },
      workspaceId,
    ),
    include: {
      assetsOnApps: {
        where: assetsOnAppsFilter,
      },
    },
  })
}
