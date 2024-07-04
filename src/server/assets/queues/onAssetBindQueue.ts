import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { DefaultAppEngine } from '@/server/ai/lib/DefaultAppEngine'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { enginesRegistry } from '@/server/extensions/appEngines/appEngines'
import { AbstractQueueManager } from '@/server/lib/AbstractQueueManager/AbstractQueueManager'
import { z } from 'zod'

const zPayload = z.object({
  workspaceId: z.string(),
  userId: z.string(),
})

type Payload = z.infer<typeof zPayload>

class AssetBindQueue extends AbstractQueueManager<typeof zPayload> {
  readonly queueName = 'assetBind'

  constructor(enqueueUrl?: string) {
    super(zPayload, { enqueueUrl })
  }

  protected async handle(action: string, payload: Payload) {
    const engines = [new DefaultAppEngine(), ...enginesRegistry]
    const context = await createUserOnWorkspaceContext(
      prisma,
      payload.workspaceId,
      payload.userId,
    )
    const appEngineRunner = new AppEngineRunner(prisma, context, engines)
    await appEngineRunner.attachAssetToApp(action)
  }
}

export const assetBindQueue = new AssetBindQueue()
