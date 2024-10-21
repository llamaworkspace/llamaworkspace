import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { AssetsOnAppsFactory } from '@/server/testing/factories/AssetsOnAppsFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Asset, AssetsOnApps, User, Workspace } from '@prisma/client'
import cuid from 'cuid'
import { ragIngestService } from '../ragIngestService'
import { TextLoadingStrategy } from '../strategies/load/TextLoadingStrategy'
import { RecursiveCharacterTextSplitStrategy } from '../strategies/split/RecursiveCharacterTextSplitStrategy'

jest.mock(
  '@/server/rag/services/strategies/split/RecursiveCharacterTextSplitStrategy',
  () => {
    const RecursiveCharacterTextSplitStrategy = jest.fn()
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    RecursiveCharacterTextSplitStrategy.prototype.split = jest
      .fn()
      .mockResolvedValue([
        { pageContent: 'this is', metadata: {} },
        { pageContent: 'a text', metadata: {} },
      ])

    return {
      RecursiveCharacterTextSplitStrategy,
    }
  },
)

jest.mock('@/server/rag/services/registries/fileLoadersRegistry.ts', () => {
  const txtFileLoader = {
    name: 'txt',
    load: jest
      .fn()
      .mockResolvedValue([{ pageContent: 'this is a text', metadata: {} }]),
  }

  return {
    fileLoadersRegistry: {
      register: jest.fn(),
      get: () => txtFileLoader,
      getOrThrow: () => txtFileLoader,
      getAll: () => [txtFileLoader],
    },
  }
})

jest.mock('@/server/rag/services/registries/embeddingsRegistry.ts', () => {
  const array1024 = Array.from({ length: 1024 }, () => 0)

  const openAIEmbeddingStrategy = {
    name: 'openai',
    embed: jest.fn().mockResolvedValue([array1024, array1024]),
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
  payload: { assetOnAppId: string; filePath: string },
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await ragIngestService(prisma, context, payload)
}

describe('ragIngestService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let asset: Asset
  let assetOnApp: AssetsOnApps
  const fakeFilePath = '/home/file.txt'

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
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, {
      assetOnAppId: assetOnApp.id,
      filePath: fakeFilePath,
    })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Update,
      expect.anything(),
      expect.anything(),
    )
  })

  it('splits text', async () => {
    await subject(workspace.id, user.id, {
      assetOnAppId: assetOnApp.id,
      filePath: fakeFilePath,
    })

    expect(RecursiveCharacterTextSplitStrategy).toHaveBeenCalled()
  })

  it('persists embeddings', async () => {
    await subject(workspace.id, user.id, {
      assetOnAppId: assetOnApp.id,
      filePath: fakeFilePath,
    })

    const embeddings = await prisma.assetEmbedding.findMany({
      where: { assetId: asset.id },
      include: { items: true },
    })

    expect(embeddings).toHaveLength(1)
    expect(embeddings[0]?.items).toHaveLength(2)
  })

  describe('when asset already has embeddings', () => {
    it('does nothing', async () => {
      await prisma.$queryRaw`
        INSERT INTO "AssetEmbedding" ("id", "assetId", "model")
        VALUES (
          ${cuid()},
          ${asset.id},
          'model-x'
        )`

      await subject(workspace.id, user.id, {
        assetOnAppId: assetOnApp.id,
        filePath: fakeFilePath,
      })

      expect(TextLoadingStrategy).not.toHaveBeenCalled()
      expect(RecursiveCharacterTextSplitStrategy).not.toHaveBeenCalled()
    })
  })
})
