import { WorkersManager } from '@/lib/WorkerManager'
import { getAssetsService } from '@/server/assets/services/getAssets.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { Promise } from 'bluebird'
import { Job } from 'bullmq'
import { z } from 'zod'

const zInput = z.object({
  appId: z.string(),
})

export const getAppAssets = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const app = await ctx.prisma.post.findFirstOrThrow({
      where: {
        id: input.appId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      app.workspaceId,
      userId,
    )
    const workersManager = new WorkersManager()

    await workersManager.enqueue('firstQueue', 'doSomethingElse', {
      userId,
      appId: input.appId,
    })

    void Promise.delay(2000).then(async () => {
      console.log('about to register processor')
      const processor = async (job: Job) => {
        await Promise.resolve()
        console.log('1111 Job processed', job.name, job.data)
      }
      workersManager.registerProcessor('firstQueue', processor)
      console.log('processor registered')
      await workersManager.enqueue('firstQueue', 'doThing', {
        userId,
        appId: input.appId,
      })
      console.log('Job enqueued')
    })

    return await getAssetsService(ctx.prisma, context, input)
  })
