import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { DefaultAppEngine } from '@/server/ai/lib/DefaultAppEngine'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { enginesRegistry } from '@/server/extensions/appEngines/appEngines'
import { AbstractQueueManager } from '@/server/lib/AbstractQueueManager/AbstractQueueManager'
import { z } from 'zod'
import { PreprocessingHandler } from './PreprocessingHandler'

const zPayload = z.object({
  userId: z.string(),
  assetOnAppId: z.string(),
})

type Payload = z.infer<typeof zPayload>

class BindAssetToAppQueue extends AbstractQueueManager<typeof zPayload> {
  readonly queueName = 'bindAssetToApp'

  constructor(enqueueUrl?: string) {
    super(zPayload, { enqueueUrl })
  }

  protected async handle(action: string, payload: Payload) {
    const engines = [new DefaultAppEngine(), ...enginesRegistry]

    const { assetOnAppId, userId } = payload

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
      userId,
    )

    // TODO: If app has flag "preprocessAssetss", then we should enqueue preprocessing here.
    const doAssetPreprocessing = true

    if (doAssetPreprocessing) {
      await new PreprocessingHandler(prisma, context).run(assetOnApp.assetId)
    }

    const appEngineRunner = new AppEngineRunner(prisma, context, engines)
    await appEngineRunner.onAssetAdded(assetOnAppId)
  }
}

export const bindAssetToAppQueue = new BindAssetToAppQueue()
