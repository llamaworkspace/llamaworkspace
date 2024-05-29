import { type infer as Infer, type ZodType } from 'zod'

type PayloadType<T extends ZodType> = Infer<T>

export abstract class AbstractEnqueuedEvent<T extends ZodType> {
  abstract readonly queueName: string
  protected abstract _handle(payload: PayloadType<T>): Promise<void>

  constructor(
    public readonly enqueueUrl: string,
    private readonly zPayloadSchema: T,
  ) {}

  async enqueue(action: string, payload: PayloadType<T>) {
    this.parsePayloadOrThrow(payload)
    const body = {
      queue: this.queueName,
      action,
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

  async handle(payload: PayloadType<T>) {
    this.parsePayloadOrThrow(payload)

    try {
      await this._handle(payload)
    } catch (err) {
      console.error('Failed to handle event', err)
    }
  }

  private parsePayloadOrThrow(payload: PayloadType<T>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.zPayloadSchema.parse(payload)
  }
}
