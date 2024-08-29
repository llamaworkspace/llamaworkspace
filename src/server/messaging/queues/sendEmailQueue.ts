import { env } from '@/env.mjs'
import { isDemoMode } from '@/shared/globalUtils'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { AbstractQueueManager } from '../../lib/AbstractQueueManager/AbstractQueueManager'

const { SMTP_EMAIL_SERVER } = env

let mailer: ReturnType<typeof nodemailer.createTransport> | null = null

if (SMTP_EMAIL_SERVER) {
  mailer = nodemailer.createTransport(SMTP_EMAIL_SERVER)
}

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
    if (!mailer || isDemoMode) {
      return this.logEmailToConsole(payload)
    }
    return await mailer.sendMail(payload)
  }

  private logEmailToConsole(payload: SendEmailEventPayload) {
    console.log(
      `EMAIL SENDING IS DISABLED: An email would have been sent to ${payload.to}, with payload:`,
      payload,
    )
  }
}

export const sendEmailQueue = new SendEmailQueue()
