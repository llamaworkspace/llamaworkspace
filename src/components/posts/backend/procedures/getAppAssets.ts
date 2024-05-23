import { getAssetsService } from '@/server/assets/services/getAssets.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { enqueue, registerProcessor } from '@/server/events/redis'
import { protectedProcedure } from '@/server/trpc/trpc'
import { Promise } from 'bluebird'
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
    await enqueue('firstQueue', 'doThing', { userId, appId: input.appId })
    Promise.delay(2000).then(() => {
      console.log('about to register processor')
      const processor = async (job) => {
        console.log('1111 Job processed', job.name, job.data)
      }
      registerProcessor('firstQueue', processor)
      console.log('processor registered')
    })

    return await getAssetsService(ctx.prisma, context, input)
  })
