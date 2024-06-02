import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { scopePostByWorkspace } from '@/server/apps/appUtils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { scopeChatByWorkspace } from '@/server/chats/chatUtils'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { scopeShareByWorkspace } from '@/server/shares/shareUtils'
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
  scopePostByWorkspace
  scopeChatByWorkspace
  scopeShareByWorkspace

  const baseWhere: Prisma.AssetWhereInput = {
    uploadStatus: AssetUploadStatus.Success,
  }

  if (appId) {
    baseWhere.apps = {
      some: {
        appId,
      },
    }
  }

  return await prisma.asset.findMany({
    where: scopeAssetByWorkspace(baseWhere, workspaceId),
  })
}
