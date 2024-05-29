import { z } from 'zod'

const zPayload = z.object({
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  text: z.string(),
})

type SendEmailEventPayload = z.infer<typeof zPayload>

export class SendEmailEvent {
  static get payloadISITNEEDEDDDDD() {
    return zPayload
  }

  readonly queueName = 'email'

  constructor(public readonly llamaqHostname: string) {}

  async enqueue(action: string, payload: SendEmailEventPayload) {
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

  async handle(payload: SendEmailEventPayload) {
    await this.parsePayload(payload)
    await Promise.resolve()
    console.log('I handle the thing here')
  }

  private async parsePayload(payload: unknown) {
    return zPayload.parseAsync(payload)
  }
}
