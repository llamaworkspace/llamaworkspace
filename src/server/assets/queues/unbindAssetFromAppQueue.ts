import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { appEnginesRegistry } from '@/server/ai/lib/engines/appEnginesRegistry'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AbstractQueueManager } from '@/server/lib/AbstractQueueManager/AbstractQueueManager'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { z } from 'zod'

const zPayload = z.object({
  userId: z.string(),
  assetOnAppId: z.string(),
})

type Payload = z.infer<typeof zPayload>

class UnbindAssetFromAppQueue extends AbstractQueueManager<typeof zPayload> {
  readonly queueName = 'unbindAssetFromApp'

  constructor(enqueueUrl?: string) {
    super(zPayload, { enqueueUrl })
  }

  protected async handle(action: string, payload: Payload) {
    return prismaAsTrx(prisma, async (prismaAsTrx) => {
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

      const appEngineRunner = new AppEngineRunner(
        prisma,
        context,
        appEnginesRegistry,
      )

      await appEngineRunner.onAssetRemoved(assetOnApp.id)
      await prismaAsTrx.assetsOnApps.deleteMany({
        where: {
          appId: assetOnApp.appId,
          assetId: assetOnApp.assetId,
        },
      })
    })
  }
}

export const unbindAssetFromAppQueue = new UnbindAssetFromAppQueue()
