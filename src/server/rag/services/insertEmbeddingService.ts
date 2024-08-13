import { prisma } from '@/server/db'
import { embed } from 'ai'
import cuid from 'cuid'
import { openaiClient } from './wip_openaiClient'

export const insertEmbeddingService = async (
  assetId: string,
  value: string,
) => {
  const { embedding } = await embed({
    model: openaiClient.embedding('text-embedding-3-large', {
      dimensions: 1024,
    }),
    value,
  })
  console.log(1111, assetId)
  const res = await prisma.$queryRaw`
    INSERT INTO "AssetEmbedding" ("id", "assetId", "contents", "embedding")
    VALUES (
      ${cuid()},
      ${assetId},
      ${value},
      ${embedding}::real[]
      )
  `
  return res
}
