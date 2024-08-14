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
import { insertEmbeddingService } from '../insertEmbeddingService'
import { ragIngestService } from '../ragIngestService'
import { TextLoadingStrategy } from '../strategies/load/TextLoadingStrategy'
import { RecursiveCharacterTextSplitStrategy } from '../strategies/split/RecursiveCharacterTextSplitStrategy'

jest.mock('@/server/rag/services/insertEmbeddingService', () => {
  return {
    insertEmbeddingService: jest.fn(),
  }
})
jest.mock('@/server/rag/services/strategies/load/TextLoadingStrategy', () => {
  const TextLoadingStrategy = jest.fn()
  TextLoadingStrategy.prototype.load = jest
    .fn()
    .mockResolvedValue('this is a text')

  return {
    TextLoadingStrategy,
  }
})
jest.mock(
  '@/server/rag/services/strategies/split/RecursiveCharacterTextSplitStrategy',
  () => {
    const RecursiveCharacterTextSplitStrategy = jest.fn()
    RecursiveCharacterTextSplitStrategy.prototype.split = jest
      .fn()
      .mockResolvedValue(['this is', 'a text'])

    return {
      RecursiveCharacterTextSplitStrategy,
    }
  },
)

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

  // it('generates embeddings', async () => {
  //   await subject(workspace.id, user.id, {
  //     assetOnAppId: assetOnApp.id,
  //     filePath: fakeFilePath,
  //   })

  //   const embeddings = await prisma.assetEmbedding.findMany({
  //     where: {
  //       assetId: 'fake',
  //     },
  //   })

  //   expect(embeddings.length).toBeGreaterThan(0)
  // })

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

    expect(insertEmbeddingService).toHaveBeenNthCalledWith(
      1,
      asset.id,
      'this is',
    )
    expect(insertEmbeddingService).toHaveBeenNthCalledWith(
      2,
      asset.id,
      'a text',
    )
  })

  describe('when asset already has embeddings', () => {
    it('does nothing', async () => {
      const vector = Array.from({ length: 1024 }).map(() => Math.random())
      await prisma.$queryRaw`
        INSERT INTO "AssetEmbedding" ("id", "assetId", "model", "contents", "embedding")
        VALUES (
          ${cuid()},
          ${asset.id},
          'model-x',
          'this is',
          ${vector}::real[]
        )`

      await subject(workspace.id, user.id, {
        assetOnAppId: assetOnApp.id,
        filePath: fakeFilePath,
      })

      expect(insertEmbeddingService).not.toHaveBeenCalled()
      expect(TextLoadingStrategy).not.toHaveBeenCalled()
      expect(RecursiveCharacterTextSplitStrategy).not.toHaveBeenCalled()
    })
  })

  describe('when the format is not supported', () => {
    beforeEach(async () => {
      await prisma.asset.update({
        where: { id: asset.id },
        data: { extension: 'rand', originalName: 'file.rand' },
      })
    })
    it('throws', async () => {
      await expect(
        subject(workspace.id, user.id, {
          assetOnAppId: assetOnApp.id,
          filePath: fakeFilePath,
        }),
      ).rejects.toThrow()
    })
  })

  describe('when the format is supported', () => {
    it('and format is txt, it calls TextLoadingStrategy', async () => {
      await subject(workspace.id, user.id, {
        assetOnAppId: assetOnApp.id,
        filePath: fakeFilePath,
      })

      expect(TextLoadingStrategy).toHaveBeenCalled()
      expect(TextLoadingStrategy.prototype.load).toHaveBeenCalled()
    })

    it.todo('and format is pdf, it calls PdfLoadingStrategy')
    it.todo('and format is md, it calls Whatever')
  })
})
