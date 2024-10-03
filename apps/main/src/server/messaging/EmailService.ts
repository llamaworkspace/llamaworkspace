import { renderAsync } from '@react-email/components'
import createHttpError from 'http-errors'
import { createElement } from 'react'
import _ from 'underscore'
import type { ZodRawShape, z } from 'zod'
import { emailsCatalog } from './emailsCatalog'
import { sendEmail } from './mailer'

interface SendParams {
  templateName: string
  to: string
  payload: Record<string, string>
}

export class EmailService {
  async send({ to, templateName, payload }: SendParams) {
    const template = this.getTemplateByName(templateName)

    if (!template) {
      throw createHttpError(500, `Email template "${templateName}" not found`)
    }

    await this.validateParamsOrThrow(template.paramsValidator, payload)

    const element = createElement(template.reactFC, payload)
    const subject = this.buildSubject(template.subject, payload)
    const emailHtml = await renderAsync(element)

    await sendEmail({
      to,
      subject,
      text: emailHtml,
      html: emailHtml,
    })
  }

  private getTemplateByName(name: string) {
    return emailsCatalog.find((item) => item.name === name)
  }

  private async validateParamsOrThrow(
    zodValidator: z.ZodObject<ZodRawShape>,
    payload: Record<string, string>,
  ) {
    return await zodValidator.parseAsync(payload)
  }

  private buildSubject(
    subjectAsTemplate: string,
    payload: Record<string, string>,
  ) {
    // Moustache like interpolation. ie: {{ name }}
    const factory = _.template(
      subjectAsTemplate,
      (_.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g,
      }),
    )
    return factory(payload)
  }
}
