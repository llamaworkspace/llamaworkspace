import { AssetUploadStatus } from '@/components/assets/assetTypes'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { TRPCError } from '@trpc/server'
import { scopeAssetByWorkspace } from '../assetUtils'
import { assetBindQueue } from '../queues/onAssetBindQueue'

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

    const relationExists = await prisma.assetsOnApps.count({
      where: {
        appId,
        assetId,
      },
    })
    if (!relationExists) {
      await prisma.assetsOnApps.create({
        data: {
          appId,
          assetId,
        },
      })
      await assetBindQueue.enqueue('bindAsset', {
        userId,
        appId,
        assetId,
      })
    }
  })
}
