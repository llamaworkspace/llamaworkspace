import { env } from '@env.mjs'
import nodemailer from 'nodemailer'
import { sendEmailQueue } from './queues/sendEmailQueue'

const { SMTP_EMAIL_SERVER, SMTP_EMAIL_FROM } = env

const mailer = nodemailer.createTransport(SMTP_EMAIL_SERVER)

interface ISendEmailParams {
  fromName?: string
  fromEmail?: string
  to: string
  subject: string
  body: string
}

export const sendEmail = async (
  params: ISendEmailParams,
  options?: nodemailer.SendMailOptions,
) => {
  if (env.NODE_ENV === 'test') {
    throw new Error('sendEmail is not available in test environment')
  }

  const { fromName, fromEmail, to, subject, body: text } = params

  const from = fromName
    ? `${fromName} <${fromEmail ?? SMTP_EMAIL_FROM}>`
    : SMTP_EMAIL_FROM

  await sendEmailQueue.enqueue('send', {
    from,
    to,
    subject,
    text,
  })
}
