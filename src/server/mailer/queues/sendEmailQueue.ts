import { env } from '@/env.mjs'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { AbstractQueueManager } from '../../lib/AbstractQueueManager/AbstractQueueManager'

const { SMTP_EMAIL_SERVER, SMTP_EMAIL_FROM } = env

const mailer = nodemailer.createTransport(SMTP_EMAIL_SERVER)

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
    return await mailer.sendMail(payload)
  }
}

export const sendEmailQueue = new SendEmailQueue()
