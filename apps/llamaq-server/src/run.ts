import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { HonoAdapter } from '@bull-board/hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Queue } from 'bullmq'
import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { redisOptions } from '.'
import { enqueueRouter } from './queueRouter'

export const run = async () => {
  const env: Env = {
    /* your Env definition */
  }
  const app = new Hono()

  app.route('/enqueue', enqueueRouter)

  const serverAdapter = new HonoAdapter(serveStatic)

  const exampleBullMq = new Queue('demo', { connection: redisOptions })

  createBullBoard({
    queues: [new BullMQAdapter(exampleBullMq)],
    serverAdapter,
  })
  const basePath = '/ui'
  serverAdapter.setBasePath(basePath)

  // ts-ignore-next-line
  app.route(basePath, serverAdapter.registerPlugin())

  app.get('/add', async (c) => {
    await exampleBullMq.add('Add', { title: c.req.query('title') })

    return c.json({ ok: true })
  })

  showRoutes(app)

  serve({ fetch: app.fetch, port: 3000 }, ({ address, port }) => {
    /* eslint-disable no-console */
    console.log(`Running on ${address}:${port}...`)
    console.log(`For the UI of instance1, open http://localhost:${port}/ui`)
    console.log('Make sure Redis is running on port 6379 by default')
    console.log('To populate the queue, run:')
    console.log(`  curl http://localhost:${port}/add?title=Example`)
    /* eslint-enable */
  })

  serve({
    fetch: app.fetch,
    port,
  })
}
