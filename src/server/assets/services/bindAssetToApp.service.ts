import { AppEngineType } from '@/components/apps/appsTypes'
import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { getLatestAppConfigForAppIdService } from '@/server/apps/services/getLatestAppConfigForAppId.service'
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
import { bindAssetToAppQueue } from '../queues/bindAssetToAppQueue'

interface BindAssetToAppPayload {
  assetId: string
  appId: string
}

export const bindAssetToAppService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: BindAssetToAppPayload,
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

      const configVersion = await getLatestAppConfigForAppIdService(
        prisma,
        uowContext,
        {
          appId,
        },
      )

      await Promise.all([
        setModelToGpt4o(prisma, configVersion.id),
        setAppEngineTypeToAssistant(prisma, appId),
      ])

      await enqueueBindAssetToApp(userId, assetOnApp.id)
    }
  })
}

const setModelToGpt4o = async (
  prisma: PrismaClientOrTrxClient,
  appConfigVersionId: string,
) => {
  await prisma.appConfigVersion.update({
    where: {
      id: appConfigVersionId,
    },
    data: {
      model: 'openai/gpt-4o',
    },
  })
}

const setAppEngineTypeToAssistant = async (
  prisma: PrismaClientOrTrxClient,
  appId: string,
) => {
  await prisma.app.update({
    where: {
      id: appId,
    },
    data: {
      engineType: AppEngineType.Assistant,
    },
  })
}

const enqueueBindAssetToApp = async (userId: string, assetOnAppId: string) => {
  // Do the actual binding here
  await bindAssetToAppQueue.enqueue('bindAssetToApp', {
    userId,
    assetOnAppId,
  })
}
