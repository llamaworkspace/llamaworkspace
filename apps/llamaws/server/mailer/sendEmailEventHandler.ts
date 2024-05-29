import { env } from 'env.mjs'
import nodemailer from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer'

const { SMTP_EMAIL_SERVER, SMTP_EMAIL_FROM } = env

const mailer = nodemailer.createTransport(SMTP_EMAIL_SERVER)

export class SendEmailEventHandlerClass {
  constructor() {}

  async call({ from, to, subject, text, ...options }: Mail.Options) {
    return await mailer.sendMail({
      from,
      to,
      subject,
      text,
      ...options,
    })
  }
}

interface SendEmailEventHandlerParams {
  from: string
  to: string
  subject: string
  text: string
}

export const sendEmailEventHandler = async (
  params: SendEmailEventHandlerParams,
  mailerOptions: Mail.Options = {},
) => {
  return await mailer.sendMail({
    from: params.from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    ...mailerOptions,
  })
}
