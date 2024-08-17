import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import cuid from 'cuid'
import { DEFAULT_EMBEDDING_MODEL } from '../ragConstants'
import { OpenAIEmbeddingStrategy } from './strategies/embed/OpenAIEmbeddingStrategy'

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

  const embedding = await new OpenAIEmbeddingStrategy().embed(value)

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
