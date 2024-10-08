import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type {
  App,
  Asset,
  AssetEmbedding,
  User,
  Workspace,
} from '@prisma/client'
import cuid from 'cuid'
import pgvector from 'pgvector'
import { DEFAULT_EMBEDDING_MODEL } from '../../ragConstants'
import { ragRetrievalService } from '../ragRetrievalService'

jest.mock(
  '@/server/rag/services/strategies/embed/OpenAIEmbeddingStrategy.ts',
  () => {
    const OpenAIEmbeddingStrategy = jest.fn()
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const array1024 = Array.from({ length: 1024 }, () => Math.random() * 2 - 1)
    OpenAIEmbeddingStrategy.prototype.embed = jest
      .fn()
      .mockResolvedValue([array1024])

    return {
      OpenAIEmbeddingStrategy,
    }
  },
)

const subject = async (
  workspaceId: string,
  userId: string,
  payload: { assetId: string; text: string },
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await ragRetrievalService(prisma, context, payload)
}

describe('ragRetrievalService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let asset: Asset
  let assetEmbedding: AssetEmbedding & { embedding: number[] }

  beforeEach(async () => {
    jest.clearAllMocks()

    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
    asset = await AssetFactory.create(prisma, {
      workspaceId: workspace.id,
      originalName: 'test.txt',
      extension: 'txt',
      uploadStatus: AssetUploadStatus.Success,
    })
    const embedding = pgvector.toSql(
      Array.from({ length: 1024 }).map(() => Math.random()),
    ) as number[]

    assetEmbedding = await prisma.$queryRaw`
    INSERT INTO "AssetEmbedding" ("id", "assetId", "model", "contents", "embedding")
    VALUES (
      ${cuid()},
      ${asset.id},
      ${DEFAULT_EMBEDDING_MODEL},
      'this is a text',
      ${embedding}::vector
      )
    `
  })

  it('performs retrieval', async () => {
    jest
      .spyOn(prisma, '$queryRaw')
      .mockResolvedValue([{ id: cuid(), contents: 'this is a text' }])
    const response = await subject(workspace.id, user.id, {
      assetId: asset.id,
      text: 'pepe car',
    })

    expect(response).toHaveLength(1)
    const firstItem = response[0]!

    expect(firstItem).toBe('this is a text')
  })
})
