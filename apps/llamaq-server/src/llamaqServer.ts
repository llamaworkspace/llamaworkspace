import { bullBoardService } from '@/apps/bullboard/bullBoardService'
import { llamaQManager } from '@/apps/llamaq/lib/llamaQManager'
import { llamaqRouter } from '@/apps/llamaq/llamaqRouter'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000

const run = async () => {
  const app = new Hono()
  const queues = await llamaQManager.bootstrap()
  bullBoardService.registerRouter(app, '/ui')
  queues.forEach((queue) => bullBoardService.addQueue(queue))

  app.route('/llamaq', llamaqRouter)

  serve({ fetch: app.fetch, port: PORT }, ({ address, port }) => {
    /* eslint-disable no-console */
    console.log(`LlamaQ Running on ${address}:${port}...`)
    console.log(`To access the Bull UI, open http://localhost:${port}/ui`)
    /* eslint-enable */
  })
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
