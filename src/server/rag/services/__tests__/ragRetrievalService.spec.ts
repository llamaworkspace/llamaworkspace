import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { AssetsOnAppsFactory } from '@/server/testing/factories/AssetsOnAppsFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type {
  App,
  Asset,
  AssetEmbedding,
  AssetEmbeddingItem,
  AssetsOnApps,
  User,
  Workspace,
} from '@prisma/client'
import cuid from 'cuid'
import pgvector from 'pgvector'
import { DEFAULT_EMBEDDING_MODEL } from '../../ragConstants'
import { ragRetrievalService } from '../ragRetrievalService'

jest.mock('@/server/rag/services/registries/embeddingsRegistry.ts', () => {
  const array1024 = Array.from({ length: 1024 }, () => 0)
  const vectorArray = pgvector.toSql(array1024) as number[]

  const openAIEmbeddingStrategy = {
    name: 'openai',
    embed: jest.fn().mockResolvedValue([vectorArray, vectorArray]),
  }

  return {
    embeddingsRegistry: {
      register: jest.fn(),
      get: () => openAIEmbeddingStrategy,
      getOrThrow: () => openAIEmbeddingStrategy,
      getAll: () => [openAIEmbeddingStrategy],
    },
  }
})

const subject = async (
  workspaceId: string,
  userId: string,
  payload: { assetOnAppId: string; text: string },
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
  let assetOnApp: AssetsOnApps
  let assetEmbedding: AssetEmbedding
  let assetEmbeddingItems: AssetEmbeddingItem[]

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
    assetOnApp = await AssetsOnAppsFactory.create(prisma, {
      assetId: asset.id,
      appId: app.id,
    })
    const embedding = pgvector.toSql(Array.from({ length: 1024 }).map(() => 0))

    const [assetEmbedding] = await prisma.$queryRaw<AssetEmbedding[]>`
    INSERT INTO "AssetEmbedding" ("id", "assetId", "model")
    VALUES (
      ${cuid()},
      ${asset.id},
      ${DEFAULT_EMBEDDING_MODEL}
      )
    RETURNING *
    `

    assetEmbeddingItems = await prisma.$queryRaw`
    INSERT INTO "AssetEmbeddingItem" ("id", "assetEmbeddingId", "contents", "embedding")
    VALUES (
      ${cuid()},
      ${assetEmbedding!.id},
      'this is a text',
      ${embedding}::vector
      )
    `
  })

  it('performs retrieval', async () => {
    const response = await subject(workspace.id, user.id, {
      assetOnAppId: assetOnApp.id,
      text: '', // empty test to lead to an array of zeroes
    })

    expect(response).toHaveLength(1)
    const firstItem = response[0]!

    expect(firstItem).toBe('this is a text')
  })
})
