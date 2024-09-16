import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { DefaultAppEngine } from '@/server/ai/lib/DefaultAppEngine'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { enginesRegistry } from '@/server/extensions/appEngines/appEngines'
import { AbstractQueueManager } from '@/server/lib/AbstractQueueManager/AbstractQueueManager'
import { z } from 'zod'

const zPayload = z.object({
  userId: z.string(),
  assetOnAppId: z.string(),
})

type Payload = z.infer<typeof zPayload>

class PreprocessAssetQueue extends AbstractQueueManager<typeof zPayload> {
  readonly queueName = 'preprocessAssetQueue'

  constructor(enqueueUrl?: string) {
    super(zPayload, { enqueueUrl })
  }

  protected async handle(action: string, payload: Payload) {
    const engines = [new DefaultAppEngine(), ...enginesRegistry]

    const assetOnAppId = payload.assetOnAppId

    const assetOnApp = await prisma.assetsOnApps.findFirstOrThrow({
      where: {
        id: assetOnAppId,
      },
      include: {
        app: true,
      },
    })

    const app = await prisma.app.findFirstOrThrow({
      where: {
        id: assetOnApp.appId,
        markAsDeletedAt: null,
      },
    })

    const context = await createUserOnWorkspaceContext(
      prisma,
      app.workspaceId,
      payload.userId,
    )

    // If app has flag "preprocessAssets", then we should enqueue preprocessing here.
    // alt: Instead of calling "onAssAdded", we will call "preprocessAssets" queue.
    // on the on preprocessAssets queue...
    // if preprocess is "none", then we will call "onAssetAdded" directly.
    // if preprocesss is active, we will do the preprocessing and then do the polling. When the preprocessing is done, we will call "onAssetAdded".

    const appEngineRunner = new AppEngineRunner(prisma, context, engines)
    await appEngineRunner.onAssetAdded(assetOnAppId)
  }
}

export const preprocessAssetQueue = new PreprocessAssetQueue()
