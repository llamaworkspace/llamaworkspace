import { Job, Processor, Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis({ maxRetriesPerRequest: null })

// const myWorker = new Worker(
//   'myqueue',
//   async (thing) => {
//     console.log('JOb processed', name, data)
//   },
//   { connection },
// )

const queues = new Map<string, Queue>()
const processors = new Map<string, Processor>()

export const enqueue = async (
  queueName: string,
  action: string,
  payload: unknown,
) => {
  const queue = queues.get(queueName) ?? new Queue(queueName, { connection })
  const result = await queue.add(action, payload, { repeat })
  console.log('Job added to queue 99', queueName, action, payload, repeat)
  return result
}

const repeat = { pattern: '*/5 * * * * *' }

export const registerProcessor = (queueName: string, processor: Processor) => {
  queues.get(queueName) ?? new Queue(queueName, { connection })
  processors.set(queueName, processor)

  return new Worker(
    queueName,
    async (
      // job: Job<{ pepe: string }, { carlos: string }, string>,
      job: Job<unknown, unknown, string>,
      token: string | undefined,
    ) => {
      // const response = await fetch('http://localhost:3000/api/queue', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({ name: job.name, data: job.data }),
      // })
      // if (!response.ok) {
      //   throw new Error('Failed to process job')
      // }
      await Promise.resolve()
      console.log('Job processed', job.name, job.data)
    },
    { connection },
  )
}

export const mainThing = async () => {
  registerProcessor('prueba', async (job) => {
    await Promise.resolve()
    console.log('Job processed1111', job.name, job.data)
  })
  await enqueue('prueba', 'accccioon', { hello: 'world' })
}
