import { env } from '@/env.mjs'
import nodemailer from 'nodemailer'

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
  const { fromName, fromEmail, to, subject, body: text } = params

  const from = fromName
    ? `${fromName} <${fromEmail ?? SMTP_EMAIL_FROM}>`
    : SMTP_EMAIL_FROM

  return await mailer.sendMail({
    from,
    to,
    subject,
    text,
    ...options,
  })
}
