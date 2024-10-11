import { scopeAppByWorkspace } from '@/server/apps/appUtils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Document } from '@langchain/core/documents'
import { Promise } from 'bluebird'
import cuid from 'cuid'
import createHttpError from 'http-errors'
import { DEFAULT_EMBEDDING_MODEL } from '../ragConstants'
import { OpenAIEmbeddingStrategy } from './strategies/embed/OpenAIEmbeddingStrategy'
import type { ILoadingStrategy } from './strategies/load/ILoadingStrategy'
import { PdfLoadingStrategy } from './strategies/load/PdfLoadingStrategy'
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

    const document = await loadFile(asset.extension, filePath)
    const split = await splitText(document)
    const embeddingsWithDocuments = await generateEmbeddings(split)

    return await saveEmbeddings(prisma, assetId, embeddingsWithDocuments)
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

const loadFile = async (
  type: string,
  filePath: string,
): Promise<Document<Record<string, unknown>>> => {
  let loadingStrategy: ILoadingStrategy

  switch (type.replace('.', '')) {
    case 'txt':
      loadingStrategy = new TextLoadingStrategy()
      break

    case 'pdf':
      loadingStrategy = new PdfLoadingStrategy()
      break
    default:
      throw new Error(`Unsupported asset type: ${type}`)
  }
  const documents = await loadingStrategy.load(filePath)
  if (!documents) {
    throw createHttpError(500, 'No documents found')
  }
  return documents[0]!
}

const splitText = async (
  document: Document,
  chunkSize?: number,
  chunkOverlap?: number,
) => {
  return new RecursiveCharacterTextSplitStrategy().split(
    document,
    chunkSize,
    chunkOverlap,
  )
}

const generateEmbeddings = async (documents: Document[]) => {
  const embeddings = await new OpenAIEmbeddingStrategy().embed(documents)
  return embeddings.map((embedding, index) => ({
    document: documents[index]!,
    embedding,
  }))
}

const saveEmbeddings = async (
  prisma: PrismaTrxClient,
  assetId: string,
  embeddingsWithDocuments: { document: Document; embedding: number[] }[],
) => {
  const [result] = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO "AssetEmbedding" ("id", "assetId", "model")
    VALUES (
      ${cuid()},
      ${assetId},
      ${DEFAULT_EMBEDDING_MODEL}
      )
    RETURNING id
  `

  const assetEmbeddingId = result!.id

  await Promise.map(embeddingsWithDocuments, async (embeddingWithDocument) => {
    return await prisma.$queryRaw`
    INSERT INTO "AssetEmbeddingItem" ("id", "assetEmbeddingId", "contents", "embedding")
    VALUES (
      ${cuid()},
      ${assetEmbeddingId},
      ${embeddingWithDocument.document.pageContent},
      ${embeddingWithDocument.embedding}::real[]      
      )
  `
  })
}
