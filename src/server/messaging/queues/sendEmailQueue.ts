import { env } from '@/env.mjs'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { AbstractQueueManager } from '../../lib/AbstractQueueManager/AbstractQueueManager'

const { SMTP_EMAIL_SERVER } = env

const mailer = nodemailer.createTransport(SMTP_EMAIL_SERVER)

const zPayload = z.object({
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
})

type SendEmailEventPayload = z.infer<typeof zPayload>

class SendEmailQueue extends AbstractQueueManager<typeof zPayload> {
  readonly queueName = 'email'

  constructor(enqueueUrl?: string) {
    super(zPayload, { enqueueUrl })
  }

  protected async handle(action: string, payload: SendEmailEventPayload) {
    return await mailer.sendMail(payload)
  }
}

export const sendEmailQueue = new SendEmailQueue()
