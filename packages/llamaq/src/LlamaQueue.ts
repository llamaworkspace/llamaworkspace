import { Queue, type Processor } from 'bullmq'
import IORedis from 'ioredis'

interface WorkersManagerRegistry {
  queue: Queue
  processor?: Processor
}

export class LlamaQ {
  private readonly registry = new Map<string, WorkersManagerRegistry>()
  private readonly connection: IORedis

  constructor(connection?: IORedis) {
    this.connection = connection ?? new IORedis({ maxRetriesPerRequest: null })
  }

  enqueue = async (name: string, action: string, payload: unknown) => {
    const { queue } = this.getRegistryRecord(name)
    await queue.add(action, payload)
  }

  private getRegistryRecord = (name: string) => {
    let item = this.registry.get(name)

    if (!item) {
      item = {
        queue: new Queue(name, { connection: this.connection }),
      }
      this.registry.set(name, item)
    }

    return item
  }
}
