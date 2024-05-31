import { env } from '@/env.mjs'
import type { z, ZodType } from 'zod'

type PayloadType<T extends ZodType> = z.infer<T>

export abstract class AbstractQueueManager<T extends ZodType> {
  private readonly zPayloadSchema: T
  public readonly enqueueUrl: string

  abstract readonly queueName: string
  protected abstract handle(
    action: string,
    payload: PayloadType<T>,
  ): Promise<unknown>

  constructor(zPayloadSchema: T, enqueueUrl?: string) {
    this.zPayloadSchema = zPayloadSchema
    this.enqueueUrl = enqueueUrl ?? env.LLAMAQ_ENQUEUE_URL
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
      console.error('Failed to handle event', err)
    }
  }

  private parsePayloadOrThrow(payload: PayloadType<T>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.zPayloadSchema.parse(payload)
  }
}
