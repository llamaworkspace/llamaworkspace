import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { enginesRegistry } from '@/server/extensions/appEngines/appEngines'
import { AbstractQueueManager } from '@/server/lib/AbstractQueueManager/AbstractQueueManager'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { z } from 'zod'

const zPayload = z.object({
  userId: z.string(),
  appId: z.string(),
})

type Payload = z.infer<typeof zPayload>

class CreateAppQueue extends AbstractQueueManager<typeof zPayload> {
  readonly queueName = 'createApp'

  constructor(enqueueUrl?: string) {
    super(zPayload, { enqueueUrl })
  }

  protected async handle(action: string, payload: Payload) {
    return prismaAsTrx(prisma, async (prismaAsTrx) => {
      const app = await prismaAsTrx.app.findFirstOrThrow({
        where: {
          id: payload.appId,
          markAsDeletedAt: null,
        },
        include: {
          assetsOnApps: true,
        },
      })

      const context = await createUserOnWorkspaceContext(
        prismaAsTrx,
        app.workspaceId,
        payload.userId,
      )

      const appEngineRunner = new AppEngineRunner(
        prisma,
        context,
        enginesRegistry,
      )
      await appEngineRunner.onAppCreated(payload.appId)
    })
  }
}

export const createAppQueue = new CreateAppQueue()
