import { prisma } from '@/server/db'
import { embed } from 'ai'
import { openaiClient } from './wip_openaiClient'

interface RagIngestPayload {
  filePath: string
}

export const ragRetrievalService = async (text: string) => {
  const result = await four_retrieve(text)

  return result
}

const four_retrieve = async (text: string) => {
  const { embedding: targetEmbedding } = await embed({
    model: openaiClient.embedding('text-embedding-3-large', {
      dimensions: 1024,
    }),
    value: text,
  })

  const res = (await prisma.$queryRaw`
    SELECT id, contents
    FROM "OtherEmbedding"
    WHERE 1 - (embedding <=> ${targetEmbedding}::real[]) >= 0.3
    LIMIT 5;
  `) as { id: string; contents: string }[]

  return res.map((item) => item.contents)
}
