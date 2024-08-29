import { env } from '@/env.mjs'
import { isTest } from '@/shared/globalUtils'
import { sendEmailQueue } from './queues/sendEmailQueue'

const { SMTP_EMAIL_FROM } = env

interface ISendEmailParams {
  fromName?: string
  fromEmail?: string
  to: string
  subject: string
  text?: string
  html?: string
}

export const sendEmail = async (params: ISendEmailParams) => {
  if (isTest) {
    throw new Error('sendEmail is not available in test environment')
  }

  const { fromName, fromEmail, to, subject, text, html } = params

  const finalFromName = fromName ?? 'Llama Workspace'

  const from = finalFromName
    ? `${finalFromName} <${fromEmail ?? SMTP_EMAIL_FROM}>`
    : SMTP_EMAIL_FROM

  await sendEmailQueue.enqueue('send', {
    from,
    to,
    subject,
    text,
    html,
  })
}
