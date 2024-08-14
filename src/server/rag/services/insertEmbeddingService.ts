import { prisma } from '@/server/db'
import { embed } from 'ai'
import cuid from 'cuid'
import { DEFAULT_EMBEDDING_MODEL } from '../ragConstants'
import { openaiClient } from './utils/openaiClient'

export const insertEmbeddingService = async (
  assetId: string,
  value: string,
) => {
  const { embedding } = await embed({
    model: openaiClient.embedding(DEFAULT_EMBEDDING_MODEL, {
      dimensions: 1024,
    }),
    value,
  })

  const res = await prisma.$queryRaw`
    INSERT INTO "AssetEmbedding" ("id", "assetId", "model", "contents", "embedding")
    VALUES (
      ${cuid()},
      ${assetId},
      ${value},
      ${embedding}::real[]
      )
  `
  return res
}
