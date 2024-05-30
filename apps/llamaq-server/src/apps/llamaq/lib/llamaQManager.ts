import { Job, Queue, Worker } from 'bullmq'
import IORedis, { RedisOptions } from 'ioredis'

export class LlamaQManager {
  private readonly targetUrl: string
  private readonly queues = new Map<string, Queue>()
  private readonly connection: IORedis

  static handler() {
    return
  }

  constructor(targetUrl: string, redisOptions?: RedisOptions) {
    this.targetUrl = targetUrl
    redisOptions = redisOptions ?? { maxRetriesPerRequest: null }
    this.connection = new IORedis(redisOptions)
  }

  enqueue = async (name: string, action: string, payload: unknown) => {
    const queue = this.getOrCreateQueue(name)
    await queue.add(action, payload)
    return queue
  }

  bootstrap = async () => {
    const queues = await this.listJobsAndExtractQueues()
    queues.forEach((queueName) => {
      this.createQueue(queueName)
    })
  }

  private getOrCreateQueue = (name: string) => {
    const queue = this.queues.get(name)

    if (!queue) {
      return this.createQueue(name)
    }

    return queue
  }

  private createQueue = (name: string) => {
    if (this.queues.has(name)) {
      throw new Error(`Queue ${name} already exists`)
    }
    const queue = new Queue(name, { connection: this.connection })
    this.queues.set(name, queue)

    new Worker(name, this.processor, { connection: this.connection })
    return queue
  }

  private processor = async (job: Job<unknown, unknown, string>) => {
    const body = JSON.stringify({
      queue: job.queueName,
      action: job.name,
      payload: job.data,
    })

    const res = await fetch(this.targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
    const text = await res.text()
    if (!res.ok) {
      throw new Error(
        `Remote failed to process event. Remote response: ${res.status} ${res.statusText}. Response: ${text}`,
      )
    }

    try {
      return JSON.parse(text)
    } catch (error) {
      return text
    }
  }

  private listJobsAndExtractQueues = async () => {
    const keys = await this.connection.keys('bull:*')
    const queueNames = new Set()

    for (const key of keys) {
      const match = key.match(/^(.*):id/)
      if (match) {
        queueNames.add(match[1]?.replace('bull:', ''))
      }
    }

    return Array.from(queueNames) as string[]
  }
}

export const llamaQManager = new LlamaQManager(
  'http://localhost:3000/api/queues',
)
