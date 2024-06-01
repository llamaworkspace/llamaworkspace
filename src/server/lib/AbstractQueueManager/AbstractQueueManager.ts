import { env } from '@/env.mjs'
import type { z, ZodType } from 'zod'

type PayloadType<T extends ZodType> = z.infer<T>

interface LlamaQParams {
  enqueueUrl?: string
  accessToken?: string
}

export abstract class AbstractQueueManager<T extends ZodType> {
  private readonly zPayloadSchema: T
  public readonly enqueueUrl: string
  public readonly accessToken: string

  abstract readonly queueName: string
  protected abstract handle(
    action: string,
    payload: PayloadType<T>,
  ): Promise<unknown>

  constructor(zPayloadSchema: T, llamaQparams?: LlamaQParams) {
    const { enqueueUrl, accessToken } = llamaQparams ?? {}
    this.zPayloadSchema = zPayloadSchema
    this.enqueueUrl = enqueueUrl ?? env.LLAMAQ_ENQUEUE_URL
    this.accessToken = accessToken ?? env.LLAMAQ_ACCESS_KEY
  }

  async enqueue(action: string, payload: PayloadType<T>) {
    this.parsePayloadOrThrow(payload)
    const body = {
      queueName: this.queueName,
      actionName: action,
      payload,
    }

    const res = await fetch(this.enqueueUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!res.ok) {
      throw new Error(
        `Failed to enqueue event. Remote response: ${res.status} ${res.statusText}`,
      )
    }
  }

  async call(action: string, payload: PayloadType<T>) {
    this.parsePayloadOrThrow(payload)

    try {
      await this.handle(action, payload)
    } catch (err) {
      // Red flag
      console.error('Failed to handle event', err)
    }
  }

  private parsePayloadOrThrow(payload: PayloadType<T>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.zPayloadSchema.parse(payload)
  }
}
