import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { llamaqRouter } from './apps/llamaq/llamaqRouter'

const PORT = 4000

const run = async () => {
  const app = new Hono()

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
