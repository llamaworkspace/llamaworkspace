import { prisma } from '@/server/db'
import { AbstractQueueManager } from '@/server/lib/AbstractQueueManager/AbstractQueueManager'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { z } from 'zod'

const zPayload = z.object({
  userId: z.string(),
  appId: z.string(),
})

type Payload = z.infer<typeof zPayload>

class DeleteAppQueue extends AbstractQueueManager<typeof zPayload> {
  readonly queueName = 'deleteApp'

  constructor(enqueueUrl?: string) {
    super(zPayload, { enqueueUrl })
  }

  protected async handle(action: string, payload: Payload) {
    return prismaAsTrx(prisma, async (prismaAsTrx) => {
      await prismaAsTrx.app.delete({
        where: {
          id: payload.appId,
        },
      })

      // const context = await createUserOnWorkspaceContext(
      //   prismaAsTrx,
      //   app.workspaceId,
      //   payload.userId,
      // )

      // const engines = [new DefaultAppEngine(), ...enginesRegistry]

      // const appEngineRunner = new AppEngineRunner(prisma, context, engines)
      // await appEngineRunner.onAppDeleted(payload.appId)
    })
  }
}

export const deleteAppQueue = new DeleteAppQueue()
