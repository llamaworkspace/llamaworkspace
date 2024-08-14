import { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { embed } from 'ai'
import { DEFAULT_EMBEDDING_MODEL } from '../ragConstants'
import { openaiClient } from './utils/openaiClient'

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

  const { embedding: targetEmbedding } = await embed({
    model: openaiClient.embedding(
      DEFAULT_EMBEDDING_MODEL.replace('openai/', ''),
      {
        dimensions: 1024,
      },
    ),
    value: text,
  })

  const res = await prisma.$queryRaw<{ id: string; contents: string }[]>`
    SELECT id, contents
    FROM "AssetEmbedding"
    WHERE 1 - (embedding <=> ${targetEmbedding}::real[]) >= 0.3
    AND "assetId" = ${assetId}
    LIMIT 5;
  `

  return res.map((item) => item.contents)
}
