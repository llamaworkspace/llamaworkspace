import { env } from '@/env.mjs'
import { configure, task } from '@trigger.dev/sdk/v3'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const { SMTP_EMAIL_SERVER, NEXT_PUBLIC_DEMO_MODE } = env
const isDemo = NEXT_PUBLIC_DEMO_MODE === 'true'
let mailer: ReturnType<typeof nodemailer.createTransport> | null = null

if (SMTP_EMAIL_SERVER) {
  mailer = nodemailer.createTransport(SMTP_EMAIL_SERVER)
}

configure({
  // baseURL: 'http://localhost:3040',
  secretKey: 'tr_pat_a5qcfmm15sdtr37tpdonqyw65vq3tgwqc7k8ezgy',
})

const zPayload = z.object({
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
})

type SendEmailEventPayload = z.infer<typeof zPayload>

export const sendEmailTask = task({
  id: 'sendEmailTask',
  run: async (payload: SendEmailEventPayload, { ctx }) => {
    if (!mailer || isDemo) {
      return logEmailToConsole(payload)
    }
    return await mailer.sendMail(payload)
  },
})

const logEmailToConsole = (payload: SendEmailEventPayload) => {
  console.log(
    `EMAIL SENDING IS DISABLED: An email would have been sent to ${payload.to}, with payload:`,
    payload,
  )
}
