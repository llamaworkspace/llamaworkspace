import { Job, Processor, Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis({ maxRetriesPerRequest: null })

const queues = new Map<string, Queue>()
const processors = new Map<string, Processor>()

export const enqueue = async (
  queueName: string,
  action: string,
  payload: unknown,
) => {
  const queue = queues.get(queueName) ?? new Queue(queueName, { connection })
  await queue.add(action, payload)
  console.log('Job added to queue 777', queueName, action, payload)
}

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
      const xx = job.data

      const response = await fetch('http://localhost:3000/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: job.name, data: job.data }),
      })

      if (!response.ok) {
        throw new Error('Failed to process job')
      }
    },
    { connection },
  )
}

// const queueHandler = async (req: NextRequest, res) => {
//   const { name, data } = (await req.json()) as { name: string; data: unknown }
//   const processor = processors.get(name)
//   await processor(job, token)
//   console.log('Job processed', name, data)
// }
