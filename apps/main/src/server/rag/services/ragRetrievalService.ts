import { getAiProviderKVsService } from '@/server/ai/services/getProvidersForWorkspace.service'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { Document } from '@langchain/core/documents'
import createHttpError from 'http-errors'
import { embeddingsRegistry } from './registries/embeddingsRegistry'
import { getTargetEmbeddingModel } from './utils/getTargetEmbeddingModel'

interface RagRetrievalPayload {
  assetOnAppId: string
  text: string
}

export const ragRetrievalService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: RagRetrievalPayload,
) => {
  const { assetOnAppId, text } = payload

  const assetOnApp = await prisma.assetsOnApps.findFirstOrThrow({
    where: {
      id: assetOnAppId,
      asset: {
        workspaceId: uowContext.workspaceId,
      },
    },
    include: {
      asset: true,
      app: true,
    },
  })

  const app = assetOnApp.app

  const document = new Document({ pageContent: text })
  const targetEmbeddingModel = await getTargetEmbeddingModel(
    prisma,
    uowContext,
    app,
  )
  const providerKVs = await getAiProviderKVsService(
    prisma,
    uowContext,
    targetEmbeddingModel,
  )
  const emebeddingEngine = embeddingsRegistry.getOrThrow(targetEmbeddingModel)
  const targetEmbeddings = await emebeddingEngine.embed([document], {
    apiKey: providerKVs.apiKey,
  })

  if (!targetEmbeddings.length) {
    throw createHttpError(500, 'No embeddings were generated')
  }

  const targetEmbedding = targetEmbeddings[0]!

  const res = await prisma.$queryRaw<
    { id: string; model: string; contents: string }[]
  >`
    SELECT
      "AssetEmbedding"."id",
      "AssetEmbedding"."model",
      "AssetEmbeddingItem"."contents"
    FROM "AssetEmbedding"
    LEFT JOIN "AssetEmbeddingItem" ON "AssetEmbeddingItem"."assetEmbeddingId" = "AssetEmbedding"."id"
    WHERE 1 - (embedding <=> ${targetEmbedding}::vector) >= 0.3
    AND "assetId" = ${assetOnApp.assetId}
    LIMIT 20;
  `

  return res.map((item) => item.contents)
}
