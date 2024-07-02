import { renderAsync } from '@react-email/components'
import { createElement } from 'react'
import { emailsCatalog } from './emails-catalog/emailsCatalog'
import { sendEmail } from './mailer'

interface SendParams {
  templateName: string
  to: string
  payload: Record<string, string>
}

export class EmailServicex {
  async send({ to }: SendParams) {
    const element = createElement(emailsCatalog[0]!, {
      targetUrl: 'PEPE-is-a-car',
    })

    const emailHtml = await renderAsync(element)

    await sendEmail({
      to,
      subject: `Sign in to!`,
      body: emailHtml,
    })
  }
}
