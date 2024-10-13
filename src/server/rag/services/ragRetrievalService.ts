import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { Document } from '@langchain/core/documents'
import createHttpError from 'http-errors'
import { embeddingsRegistry } from './registries/embeddingsRegistry'

interface RagRetrievalPayload {
  assetId: string
  text: string
}

export const ragRetrievalService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: RagRetrievalPayload,
) => {
  const { assetId, text } = payload

  await prisma.asset.findFirstOrThrow({
    where: {
      id: assetId,
      workspaceId: uowContext.workspaceId,
    },
  })

  const document = new Document({ pageContent: text })

  const emebeddingEngine = embeddingsRegistry.getOrThrow('openai')
  const targetEmbeddings = await emebeddingEngine.embed([document])

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
    AND "assetId" = ${assetId}
    LIMIT 20;
  `

  return res.map((item) => item.contents)
}
