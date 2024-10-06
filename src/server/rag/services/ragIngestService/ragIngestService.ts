import { scopeAppByWorkspace } from '@/server/apps/appUtils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { vectorDb } from '@/server/vectorDb'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Document } from '@langchain/core/documents'
import { Promise } from 'bluebird'
import cuid from 'cuid'
import createHttpError from 'http-errors'
import { DEFAULT_EMBEDDING_MODEL } from '../../ragConstants'
import { OpenAIEmbeddingStrategy } from '../strategies/embed/OpenAIEmbeddingStrategy'
import { PdfLoadingStrategy } from '../strategies/load/PdfLoadingStrategy'
import { RecursiveCharacterTextSplitStrategy } from '../strategies/split/RecursiveCharacterTextSplitStrategy'

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
    // const hasEmbeddings = await hasEmbeddingsForAsset(assetId)
    // if (hasEmbeddings) {
    //   return
    // }
    const tempFilePath = './tmp/bb.pdf'
    const document = await loadFile(asset.extension, tempFilePath)

    const split = await splitText(document, 50, 10)

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

const hasEmbeddingsForAsset = async (assetId: string) => {
  const embeddings = await vectorDb.assetEmbedding.findMany({
    where: {
      assetId,
    },
  })

  return embeddings.length > 0
}

const loadFile = async (type: string, filePath: string) => {
  let document: Document
  switch (type.replace('.', '')) {
    // case 'txt':
    //   return await new TextLoadingStrategy().load(filePath)
    case 'pdf':
      const documents = await new PdfLoadingStrategy().load(filePath)
      if (!documents) {
        throw createHttpError(500, 'No documents found')
      }
      document = documents[0]!
      break
    default:
      throw new Error(`Unsupported asset type: ${type}`)
  }
  return document
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
  await Promise.map(embeddingsWithDocuments, async (embeddingWithDocument) => {
    return await prisma.$queryRaw`
    INSERT INTO "AssetEmbedding" ("id", "assetId", "model", "contents", "embedding")
    VALUES (
      ${cuid()},
      ${assetId},
      ${DEFAULT_EMBEDDING_MODEL},
      ${embeddingWithDocument.document.pageContent},
      ${embeddingWithDocument.embedding}::real[]      
      )
  `
  })
}
