import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { llamaQ } from './llamaQSingleton'
import { queueRouter } from './queueRouter'

const PORT = 4000

// async function listJobsAndExtractQueues() {
//   const connection = new IORedis()
//   const keys = await connection.keys('*')
//   const queueNames = new Set()
//   console.log(keys)
//   for (const key of keys) {
//     const match = key.match(/^(.*):id/)
//     if (match) {
//       queueNames.add(match[1]?.replace('bull:', ''))
//     }
//   }

//   console.log(Array.from(queueNames))
//   return Array.from(queueNames) as string[]
// }

const run = async () => {
  const app = new Hono()
  await llamaQ.bootstrap()
  // const queues = await listJobsAndExtractQueues()
  app.route('/queue', queueRouter)

  // queues.forEach((queueName) => {
  //   bullBoard.addQueue(
  //     new BullMQAdapter(
  //       new Queue(queueName, { connection: new IORedis(redisOptions) }),
  //     ),
  //   )
  // })

  // @ts-ignore
  // app.route('/ui', serverAdapter.registerPlugin())

  // showRoutes(app)

  serve({ fetch: app.fetch, port: PORT }, ({ address, port }) => {
    /* eslint-disable no-console */
    console.log(`Running on ${address}:${port}...`)
    console.log(`For the UI of instance1, open http://localhost:${port}/ui`)
    console.log('Make sure Redis is running on port 6379 by default')
    /* eslint-enable */
  })
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
