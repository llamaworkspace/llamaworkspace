import { AppEngineType } from '@/components/apps/appsTypes'
import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { getEnumByValue } from '@/lib/utils'
import { bindAssetToAppService } from '@/server/assets/services/bindAssetToApp.service'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import {
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { Promise } from 'bluebird'
import _ from 'underscore'
import { appCreateService } from './appCreate.service'
import { getLatestAppConfigForAppIdService } from './getLatestAppConfigForAppId.service'

interface AppDuplicateServiceProps {
  appId: string
}

export const appDuplicateService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: AppDuplicateServiceProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId, workspaceId } = uowContext
    const { appId } = input

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      appId,
    )

    const baseApp = await prisma.app.findUniqueOrThrow({
      where: {
        id: appId,
      },
    })

    const baseAppConfigVersion = await getLatestAppConfigForAppIdService(
      prisma,
      uowContext,
      { appId: baseApp.id },
    )

    const duplicatedApp = await appCreateService(prisma, uowContext, {
      engineType: getEnumByValue(AppEngineType, baseApp.engineType),
      title: 'Copy of ' + baseApp.title,
      emoji: baseApp.emoji ?? undefined,
    })

    const duplicatedAppConfigVersion =
      await prisma.appConfigVersion.findFirstOrThrow({
        where: {
          appId: duplicatedApp.id,
        },
      })

    // Update the duplicated app config version with the latest version's data
    await prisma.appConfigVersion.update({
      where: { id: duplicatedAppConfigVersion.id },
      data: {
        model: baseAppConfigVersion.model,
        description: baseAppConfigVersion.description,
        preprocessAssets: baseAppConfigVersion.preprocessAssets,
      },
    })

    await prisma.message.deleteMany({
      where: {
        appConfigVersionId: duplicatedAppConfigVersion.id,
      },
    })

    await Promise.map(baseAppConfigVersion.messages, async (message) => {
      const partialMessage = _.omit(message, [
        'id',
        'chatId',
        'appConfigVersionId',
        'createdAt',
        'updatedAt',
      ])
      await prisma.message.create({
        data: {
          ...partialMessage,
          appConfigVersionId: duplicatedAppConfigVersion.id,
        },
      })
    })

    await prisma.message.updateMany({
      where: {
        appConfigVersionId: baseAppConfigVersion.id,
      },
      data: {
        message: duplicatedAppConfigVersion.id,
      },
    })

    const assetsOnApps = await prisma.assetsOnApps.findMany({
      where: {
        appId: baseApp.id,
        asset: {
          uploadStatus: AssetUploadStatus.Success,
        },
      },
    })

    await Promise.map(assetsOnApps, async (assetOnApp) => {
      await bindAssetToAppService(prisma, uowContext, {
        assetId: assetOnApp.assetId,
        appId: duplicatedApp.id,
      })
    })

    return duplicatedApp
  })
}
