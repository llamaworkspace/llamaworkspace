import { z } from 'zod'

const zPayload = z.object({
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  text: z.string(),
})

type SendEmailEventPayload = z.infer<typeof zPayload>

abstract class AbstractEnqueuedEvent<EventPayload> {
  abstract readonly queueName: string
  constructor(public readonly llamaqHostname: string) {}

  async enqueue(action: string, payload: EventPayload) {
    await this.parsePayload(payload)
    const body = {
      queue: this.queueName,
      action,
      payload,
    }
    console.log('Enqueueing email', body)
    const res = await fetch(`${this.llamaqHostname}/queue/enqueue`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const json = await res.text()
    console.log('Enqueued email', res.status, res.statusText, json)
  }

  abstract handle(payload: SendEmailEventPayload): Promise<void>

  protected async parsePayload(payload: unknown) {
    return zPayload.parseAsync(payload)
  }
}

export class SendEmailEvent extends AbstractEnqueuedEvent<SendEmailEventPayload> {
  readonly queueName = 'email'

  async handle(payload: SendEmailEventPayload) {
    await this.parsePayload(payload)
    await Promise.resolve()
    console.log('I handle the thing here')
  }
}
