import { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { embed } from 'ai'
import cuid from 'cuid'
import { DEFAULT_EMBEDDING_MODEL } from '../ragConstants'
import { openaiClient } from './utils/openaiClient'

interface InsertEmbeddingPayload {
  assetId: string
  text: string
}

export const insertEmbeddingService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: InsertEmbeddingPayload,
) => {
  const { assetId, text: value } = payload

  await prisma.asset.findFirstOrThrow({
    where: {
      id: assetId,
      workspaceId: uowContext.workspaceId,
    },
  })

  const { embedding } = await embed({
    model: openaiClient.embedding(
      DEFAULT_EMBEDDING_MODEL.replace('openai/', ''),
      {
        dimensions: 1024,
      },
    ),
    value,
  })

  const res = await prisma.$queryRaw`
    INSERT INTO "AssetEmbedding" ("id", "assetId", "model", "contents", "embedding")
    VALUES (
      ${cuid()},
      ${assetId},
      ${DEFAULT_EMBEDDING_MODEL},
      ${value},
      ${embedding}::real[]
      )
  `
  return res
}
