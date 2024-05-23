import { Job, Processor, Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { NextRequest } from 'next/server'

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
  await queue.add(action, payload)
  console.log('Job added to queue', queueName, action, payload)
}
// Problem: In a serverless env, this isn't active. We move this tiny part elsewhere.

const runnerFunc = () => {}

export const registerProcessor = (queueName: string, processor: Processor) => {
  queues.get(queueName) ?? new Queue(queueName, { connection })
  processors.set(queueName, processor)

  return new Worker(
    queueName,
    async (job: Job<any, any, string>, token: string | undefined) => {
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

const queueHandler = async (req: NextRequest, res) => {
  const { name, data } = (await req.json()) as { name: string; data: unknown }
  const processor = processors.get(name)
  await processor(job, token)
  console.log('Job processed', name, data)
}
