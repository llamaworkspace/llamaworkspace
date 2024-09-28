import { EMPTY_APP_NAME } from '@/components/apps/appsConstants'
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
import type { AppConfigVersion, Message } from '@prisma/client'
import { Promise } from 'bluebird'
import _ from 'underscore'
import { appCreateService } from './appCreate.service'
import { getAppKeyValuesService } from './getAppKeyValues.service'
import { getLatestAppConfigForAppIdService } from './getLatestAppConfigForAppId.service'
import { upsertAppKeyValuesService } from './upsertAppKeyValues.service'

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

    const duplicatedApp = await createDuplicatedApp(prisma, uowContext, {
      engineType: getEnumByValue(AppEngineType, baseApp.engineType),
      title: baseApp.title ?? `Copy of ${EMPTY_APP_NAME}`,
      emoji: baseApp.emoji ?? undefined,
    })

    const duplicatedAppConfigVersion = await duplicateAppConfigVersion(
      prisma,
      baseAppConfigVersion,
      duplicatedApp.id,
    )

    await Promise.all([
      await duplicateSystemMessages(
        prisma,
        baseAppConfigVersion.messages,
        duplicatedAppConfigVersion.id,
      ),

      await duplicateAssets(prisma, uowContext, baseApp.id, duplicatedApp.id),

      await duplicateKeyValues(
        prisma,
        uowContext,
        baseApp.id,
        duplicatedApp.id,
      ),
    ])

    return duplicatedApp
  })
}

interface DuplicateAppInput {
  engineType: AppEngineType
  title: string
  emoji?: string
}

const createDuplicatedApp = async (
  prisma: PrismaTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: DuplicateAppInput,
) => {
  return await appCreateService(prisma, uowContext, {
    engineType: getEnumByValue(AppEngineType, input.engineType),
    title: 'Copy of ' + input.title,
    emoji: input.emoji ?? undefined,
  })
}

const duplicateAppConfigVersion = async (
  prisma: PrismaTrxClient,
  baseAppConfigVersion: AppConfigVersion,
  duplicatedAppId: string,
) => {
  const duplicatedAppConfigVersion =
    await prisma.appConfigVersion.findFirstOrThrow({
      where: {
        appId: duplicatedAppId,
      },
    })

  // Update the duplicated app config version with the latest version's data
  return await prisma.appConfigVersion.update({
    where: { id: duplicatedAppConfigVersion.id },
    data: {
      model: baseAppConfigVersion.model,
      description: baseAppConfigVersion.description,
      preprocessAssets: baseAppConfigVersion.preprocessAssets,
    },
  })
}

const duplicateSystemMessages = async (
  prisma: PrismaTrxClient,
  originalMessages: Message[],
  duplicatedAppConfigVersionId: string,
) => {
  await prisma.message.deleteMany({
    where: {
      appConfigVersionId: duplicatedAppConfigVersionId,
    },
  })

  await Promise.map(originalMessages, async (message) => {
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
        appConfigVersionId: duplicatedAppConfigVersionId,
      },
    })
  })
}

const duplicateAssets = async (
  prisma: PrismaTrxClient,
  uowContext: UserOnWorkspaceContext,
  baseAppId: string,
  duplicatedAppId: string,
) => {
  const assetsOnApps = await prisma.assetsOnApps.findMany({
    where: {
      appId: baseAppId,
      asset: {
        uploadStatus: AssetUploadStatus.Success,
      },
    },
  })

  await Promise.map(assetsOnApps, async (assetOnApp) => {
    await bindAssetToAppService(prisma, uowContext, {
      assetId: assetOnApp.assetId,
      appId: duplicatedAppId,
    })
  })
}

const duplicateKeyValues = async (
  prisma: PrismaTrxClient,
  uowContext: UserOnWorkspaceContext,
  originalAppId: string,
  duplicatedAppId: string,
) => {
  const { data } = await getAppKeyValuesService(prisma, uowContext, {
    appId: originalAppId,
  })

  await upsertAppKeyValuesService(prisma, uowContext, {
    appId: duplicatedAppId,
    keyValuePairs: data,
  })
}
