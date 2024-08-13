import { AssetUploadStatus } from '@/components/assets/assetTypes'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import {
  AssetOnAppStatus,
  type PrismaClientOrTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { TRPCError } from '@trpc/server'
import { scopeAssetByWorkspace } from '../assetUtils'
import { bindAssetQueue } from '../queues/bindAssetQueue'

interface BindAssetPayload {
  assetId: string
  appId: string
}

export const bindAssetService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: BindAssetPayload,
) => {
  const { workspaceId, userId } = uowContext
  const { assetId, appId } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      appId,
    )

    const asset = await prisma.asset.findFirstOrThrow({
      where: scopeAssetByWorkspace({ id: assetId }, workspaceId),
    })

    if (asset?.uploadStatus !== AssetUploadStatus.Success.toString()) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unuploaded assets cannot be attached',
      })
    }

    let assetOnApp = await prisma.assetsOnApps.findFirst({
      where: {
        appId,
        assetId,
      },
    })

    if (!assetOnApp) {
      assetOnApp = await prisma.assetsOnApps.create({
        data: {
          appId,
          assetId,
          status: AssetOnAppStatus.Processing,
        },
      })
      await bindAssetQueue.enqueue('bindAsset', {
        userId,
        assetOnAppId: assetOnApp.id,
      })
    }
  })
}
