import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { appEnginesRegistry } from '@/server/ai/lib/engines/appEnginesRegistry'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
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
      console.log('Starting asset preprocessing')
      await new PreprocessingHandler(prisma, context).run(assetOnApp.assetId)
      console.log('Finish asset preprocessing')
    }

    const appEngineRunner = new AppEngineRunner(
      prisma,
      context,
      appEnginesRegistry,
    )
    console.log('Start onAssetAdded callback')
    await appEngineRunner.onAssetAdded(assetOnAppId)
    console.log('Finish onAssetAdded callback')
  }
}

export const bindAssetToAppQueue = new BindAssetToAppQueue()
