import { scopeAppByWorkspace } from '@/server/apps/appUtils'
import { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { PrismaClientOrTrxClient, PrismaTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { Promise } from 'bluebird'
import { insertEmbeddingService } from './insertEmbeddingService'
import { TextLoadingStrategy } from './strategies/load/TextLoadingStrategy'
import { RecursiveCharacterTextSplitStrategy } from './strategies/split/RecursiveCharacterTextSplitStrategy'

interface RagIngestPayload {
  filePath: string
  assetOnAppId: string
}

export const ragIngestService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: RagIngestPayload,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { userId, workspaceId } = uowContext
    const { filePath, assetOnAppId } = payload

    // TODO: Add max number of files to 10, and test!!!

    const assetOnApp = await getAssetOnApp(prisma, workspaceId, assetOnAppId)
    const asset = assetOnApp.asset
    const appId = assetOnApp.appId
    const assetId = assetOnApp.assetId

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      appId,
    )

    // Checks that the asset is not already ingested
    const hasEmbeddings = await hasEmbeddingsForAsset(prisma, assetId)
    if (hasEmbeddings) {
      return
    }

    const text = await loadFile(asset.extension, filePath)

    const splitted = await splitText(text)
    await Promise.map(splitted, async (text) => {
      await insertEmbeddingService(prisma, uowContext, { assetId, text })
    })
  })
}

const getAssetOnApp = (
  prisma: PrismaTrxClient,
  workspaceId: string,
  assetOnAppId: string,
) => {
  return prisma.assetsOnApps.findUniqueOrThrow({
    where: {
      id: assetOnAppId,
      app: scopeAppByWorkspace({}, workspaceId),
    },
    include: {
      app: true,
      asset: true,
    },
  })
}

const hasEmbeddingsForAsset = async (
  prisma: PrismaTrxClient,
  assetId: string,
) => {
  const embeddings = await prisma.assetEmbedding.findMany({
    where: {
      assetId,
    },
  })

  return embeddings.length > 0
}

const loadFile = async (type: string, filePath: string) => {
  switch (type.replace('.', '')) {
    case 'txt':
      return await new TextLoadingStrategy().load(filePath)
    default:
      throw new Error(`Unsupported asset type: ${type}`)
  }
}

const splitText = async (text: string, chunkSize = 800, chunkOverlap = 400) => {
  return new RecursiveCharacterTextSplitStrategy().split(text)
}
