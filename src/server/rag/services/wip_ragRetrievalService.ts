import { prisma } from '@/server/db'
import { embed } from 'ai'
import { openaiClient } from './wip_openaiClient'

export const ragRetrievalService = async (assetId: string, text: string) => {
  const { embedding: targetEmbedding } = await embed({
    model: openaiClient.embedding('text-embedding-3-large', {
      dimensions: 1024,
    }),
    value: text,
  })

  const res = (await prisma.$queryRaw`
    SELECT id, contents
    FROM "AssetEmbedding"
    WHERE 1 - (embedding <=> ${targetEmbedding}::real[]) >= 0.3
    AND "assetId" = ${assetId}
    LIMIT 5;
  `) as { id: string; contents: string }[]

  return res.map((item) => item.contents)
}
