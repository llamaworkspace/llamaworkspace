import { z } from 'zod'
import { AbstractQueueManager } from '../../lib/AbstractQueueManager/AbstractQueueManager'

const zPayload = z.object({
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  text: z.string(),
})

type SendEmailEventPayload = z.infer<typeof zPayload>

class SendEmailQueue extends AbstractQueueManager<typeof zPayload> {
  readonly queueName = 'email'

  constructor(llamaqHostname?: string) {
    super(zPayload, llamaqHostname)
  }

  protected async handle(action: string, payload: SendEmailEventPayload) {
    await Promise.resolve()
    console.log('I handle the thing here')
  }
}

export const sendEmailQueue = new SendEmailQueue()
