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
import { insertEmbeddingService } from '../insertEmbeddingService/insertEmbeddingService'
import { TextLoadingStrategy } from '../insertEmbeddingService/load/TextLoadingStrategy'
import { ragIngestService } from '../ragIngestService'

jest.mock(
  '@/server/rag/services/insertEmbeddingService/insertEmbeddingService',
  () => {
    return {
      insertEmbeddingService: jest.fn(),
    }
  },
)
jest.mock(
  '@/server/rag/services/insertEmbeddingService/load/TextLoadingStrategy',
  () => {
    const TextLoadingStrategy = jest.fn()
    TextLoadingStrategy.prototype.load = jest
      .fn()
      .mockResolvedValue('this is a text')

    return {
      TextLoadingStrategy,
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

  it('generates embeddings', async () => {
    await subject(workspace.id, user.id, {
      assetOnAppId: assetOnApp.id,
      filePath: fakeFilePath,
    })

    const embeddings = await prisma.assetEmbedding.findMany({
      where: {
        assetId: 'fake',
      },
    })

    expect(embeddings.length).toBeGreaterThan(0)
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

  it.only('calls insertEmbeddingService', async () => {
    await subject(workspace.id, user.id, {
      assetOnAppId: assetOnApp.id,
      filePath: fakeFilePath,
    })

    expect(insertEmbeddingService).toHaveBeenCalledWith(
      asset.id,
      'this is a text',
    )
  })

  describe('when asset already has embeddings', () => {
    it.todo('does nothing')
  })

  describe('when the format is not supported', () => {
    it.todo('throws')
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
