import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { App, Asset, User, Workspace } from '@prisma/client'
import { DEFAULT_EMBEDDING_MODEL } from '../../ragConstants'
import { insertEmbeddingService } from '../insertEmbeddingService'

jest.mock('ai', () => {
  return {
    embed: jest.fn().mockResolvedValue({
      embedding: Array.from({ length: 1024 }).map(() => Math.random()),
    }),
  }
})

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
  return await insertEmbeddingService(prisma, context, payload)
}

describe('insertEmbeddingService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let asset: Asset

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
  })

  it('persists embeddings', async () => {
    await subject(workspace.id, user.id, {
      assetId: asset.id,
      text: 'pepe car',
    })

    const embeddings = (await prisma.$queryRaw`
      SELECT id, model, "assetId", contents, embedding::real[]
      FROM "AssetEmbedding"
      WHERE "assetId" = ${asset.id};
    `) as { id: string; contents: string }[]

    expect(embeddings).toHaveLength(1)
    const embedding = embeddings[0]!

    expect(embedding).toMatchObject({
      assetId: asset.id,
      model: DEFAULT_EMBEDDING_MODEL,
      contents: 'pepe car',
      embedding: expect.any(Array),
    })
  })
})
