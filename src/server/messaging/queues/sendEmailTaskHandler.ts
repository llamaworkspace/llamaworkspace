import { env } from '@/env.mjs'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const { SMTP_EMAIL_SERVER, NEXT_PUBLIC_DEMO_MODE } = env
const isDemo = NEXT_PUBLIC_DEMO_MODE === 'true'
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

export type SendEmailTaskPayload = z.infer<typeof zPayload>

export const sendEmailTaskHandler = async (payload: SendEmailTaskPayload) => {
  zPayload.parse(payload)

  if (!mailer || isDemo) {
    return logEmailToConsole(payload)
  }
  return await mailer.sendMail(payload)
}

const logEmailToConsole = (payload: SendEmailTaskPayload) => {
  console.log(
    `EMAIL SENDING IS DISABLED: An email would have been sent to ${payload.to}, with payload:`,
    payload,
  )
}
