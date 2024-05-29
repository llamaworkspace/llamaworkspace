import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300 // 5 minutes

interface LlamaQPayload {
  queue: string
  action: string
  payload: unknown
}

class SendEmailQueue {
  public readonly queueName = 'user'
  public readonly name = 'user:sendEmail'

  async enqueue() {
    await fetch('https://localhost:4000/queue/enqueue', {
      method: 'POST',
      body: JSON.stringify({
        queue: this.queueName,
        action: this.name,
        payload: {
          userId: '123',
        },
      }),
    })
  }

  async call(req: NextRequest) {
    await this.handler(payload)
  }

  async handler(payload: { userId: string }) {
    await Promise.resolve()
    console.log('I handle the thing here')
  }
}

class QueuesManager {
  private readonly queueProvidersMap: Map<string, unknown>

  constructor(queueProviders: unknown[]) {
    queueProviders.forEach((provider) => {
      this.queueProvidersMap.set(provider.name, provider)
    })
  }

  async call(queueName: string, req: NextRequest) {
    const queueProvider = this.queueProvidersMap.get(queueName)
    if (!queueProvider) {
      throw new Error('Queue not found')
    }

    await queueProvider.call(req)
  }
}

const queueProviders = [SendEmailQueue]
const queuesManager = new QueuesManager(queueProviders)

export async function POST(req: NextRequest) {
  const { queue, action, payload } = (await req.json()) as LlamaQPayload

  try {
    await queuesManager.call(queue, action, payload)
    return NextResponse.json(json)
  } catch (error) {
    throw error
  }
}
