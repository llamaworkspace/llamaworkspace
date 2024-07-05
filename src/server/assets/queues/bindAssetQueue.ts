import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { DefaultAppEngine } from '@/server/ai/lib/DefaultAppEngine'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { enginesRegistry } from '@/server/extensions/appEngines/appEngines'
import { AbstractQueueManager } from '@/server/lib/AbstractQueueManager/AbstractQueueManager'
import { z } from 'zod'

const zPayload = z.object({
  userId: z.string(),
  appId: z.string(),
  assetId: z.string(),
})

type Payload = z.infer<typeof zPayload>

class BindAssetQueue extends AbstractQueueManager<typeof zPayload> {
  readonly queueName = 'bindAsset'

  constructor(enqueueUrl?: string) {
    super(zPayload, { enqueueUrl })
  }

  protected async handle(action: string, payload: Payload) {
    const engines = [new DefaultAppEngine(), ...enginesRegistry]

    const app = await prisma.app.findFirstOrThrow({
      where: {
        id: payload.appId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      prisma,
      app.workspaceId,
      payload.userId,
    )

    const appEngineRunner = new AppEngineRunner(prisma, context, engines)
    await appEngineRunner.attachAsset(payload.appId, payload.assetId)
  }
}

export const bindAssetQueue = new BindAssetQueue()
