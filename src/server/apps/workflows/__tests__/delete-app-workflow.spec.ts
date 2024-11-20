import { AssetUploadStatus } from '@/components/assets/assetTypes'
import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { AssetFactory } from '@/server/testing/factories/AssetFactory'
import { AssetsOnAppsFactory } from '@/server/testing/factories/AssetsOnAppsFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { Context } from '@hatchet-dev/typescript-sdk'
import type { App, Asset, AssetsOnApps, User, Workspace } from '@prisma/client'
import {
  DeleteAppWorkflowPayload,
  deleteAppWorkflow,
} from '../delete-app-workflow'

jest.mock('@/server/ai/lib/AppEngineRunner/AppEngineRunner', () => {
  const AppEngineRunner = jest.fn()

  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  AppEngineRunner.prototype.onAssetRemoved = jest.fn()
  AppEngineRunner.prototype.onAppDeleted = jest.fn()
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */

  return {
    AppEngineRunner,
  }
})

const subject = async (payload: { userId: string; appId: string }) => {
  const context = {
    workflowInput: () => payload,
  } as Context<DeleteAppWorkflowPayload>
  return await deleteAppWorkflow.workflow.steps[0]!.run(context)
}

describe('deleteAppWorkflow', () => {
  let workspace: Workspace
  let user: User
  let app: App

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
  })

  it('deletes the app', async () => {
    await subject({ userId: user.id, appId: app.id })
    const appInDb = await prisma.app.findFirst({
      where: {
        id: app.id,
      },
    })
    expect(appInDb).toBeNull()
  })

  it('invokes appEngineRunner.onAppDeleted', async () => {
    await subject({ userId: user.id, appId: app.id })

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const onAppDeletedSpy = AppEngineRunner.prototype.onAppDeleted as jest.Mock

    expect(onAppDeletedSpy).toHaveBeenCalledWith(app.id)
  })

  describe('when the app has assets', () => {
    let asset1: Asset
    let asset2: Asset
    let assetoOnApp1: AssetsOnApps
    let assetoOnApp2: AssetsOnApps

    beforeEach(async () => {
      asset1 = await AssetFactory.create(prisma, {
        workspaceId: workspace.id,
        originalName: 'test.png',
        uploadStatus: AssetUploadStatus.Success,
      })
      asset2 = await AssetFactory.create(prisma, {
        workspaceId: workspace.id,
        originalName: 'test2.png',
        uploadStatus: AssetUploadStatus.Success,
      })

      assetoOnApp1 = await AssetsOnAppsFactory.create(prisma, {
        assetId: asset1.id,
        appId: app.id,
      })
      assetoOnApp2 = await AssetsOnAppsFactory.create(prisma, {
        assetId: asset2.id,
        appId: app.id,
      })
    })

    it('invokes appEngineRunner.onAssetRemoved for each asset', async () => {
      await subject({ userId: user.id, appId: app.id })

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const onAssetRemovedSpy = AppEngineRunner.prototype
        .onAssetRemoved as jest.Mock

      expect(onAssetRemovedSpy).toHaveBeenCalledTimes(2)
      expect(onAssetRemovedSpy).toHaveBeenNthCalledWith(1, assetoOnApp1.id)
      expect(onAssetRemovedSpy).toHaveBeenNthCalledWith(2, assetoOnApp2.id)
    })
  })
})
