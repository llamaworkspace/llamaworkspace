import { AssetUploadStatus } from '@/components/assets/assetTypes'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import {
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { TRPCError } from '@trpc/server'

interface AppUpdateServiceInputProps {
  appId: string
  assetId: string
}

export const appAttachAssetService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: AppUpdateServiceInputProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId } = uowContext
    const { appId, assetId } = input

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      appId,
    )

    const asset = await prisma.asset.findUnique({
      where: {
        id: assetId,
      },
    })

    if (asset?.uploadStatus !== AssetUploadStatus.Success) {
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
      return await prisma.assetsOnApps.create({
        data: {
          appId,
          assetId,
        },
      })
    }
  })
}
