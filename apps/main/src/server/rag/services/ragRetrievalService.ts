import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { vectorDb } from '@/server/vectorDb'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { OpenAIEmbeddingStrategy } from './strategies/embed/OpenAIEmbeddingStrategy'

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

  const targetEmbedding = await new OpenAIEmbeddingStrategy().embed(text)

  const res = await vectorDb.$queryRaw<{ id: string; contents: string }[]>`
    SELECT id, contents
    FROM "AssetEmbedding"
    WHERE 1 - (embedding <=> ${targetEmbedding}::vector) >= 0.3
    AND "assetId" = ${assetId}
    LIMIT 5;
  `

  return res.map((item) => item.contents)
}
