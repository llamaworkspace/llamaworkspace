import { sendEmailQueue } from '../mailer/queues/sendEmailQueue'

export const queues = [sendEmailQueue]

interface IQueues<PayloadType> {
  enqueue: (action: string, payload: PayloadType) => Promise<void>
  call: (action: string, payload: PayloadType) => Promise<void>
  queue: string
}

class QueuesManager {
  private readonly queueProvidersMap = new Map<string, IQueues<unknown>>()

  constructor(queues: IQueues<any>[]) {
    queues.forEach((queue) => this.registerQueue(queue))
  }

  async call<PayloadType>(queue: string, action: string, payload: PayloadType) {
    const queue = this.queueProvidersMap.get(queue)
    if (!queue) {
      throw new Error(`Queue ${queue} not found`)
    }

    return await queue.call(action, payload)
  }

  private registerQueue(queue: IQueues<unknown>) {
    const name = queue.queue
    if (this.queueProvidersMap.has(name)) {
      throw new Error(`Queue ${name} already registered`)
    }
    this.queueProvidersMap.set(name, queue)
  }
}

const queuesManager = new QueuesManager(queues)
export { queuesManager }
