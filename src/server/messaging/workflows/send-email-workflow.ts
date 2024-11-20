import { env } from '@/env.mjs'
import type { WorkflowRegistryEntry } from '@/hatchet/lib/workflow-types'
import { isDemoMode } from '@/server/utils/globalServerUtils'
import type { Context, Workflow } from '@hatchet-dev/typescript-sdk'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const { SMTP_EMAIL_SERVER } = env

let mailer: ReturnType<typeof nodemailer.createTransport> | null = null

if (SMTP_EMAIL_SERVER) {
  mailer = nodemailer.createTransport(SMTP_EMAIL_SERVER)
}

export const zSendEmailWorkflowPayload = z.object({
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
})

type SendEmailWorkflowPayload = z.infer<typeof zSendEmailWorkflowPayload>

const logEmailToConsole = (payload: SendEmailWorkflowPayload) => {
  console.log(
    `EMAIL SENDING IS DISABLED: An email would have been sent to ${payload.to}, with payload:`,
    payload,
  )
}

const sendEmailHandler = async (ctx: Context<SendEmailWorkflowPayload>) => {
  const payload = ctx.workflowInput()

  if (!mailer || isDemoMode) {
    return logEmailToConsole(payload)
  }
  await mailer.sendMail(payload)
}

export const sendEmailWorkflowHandler: Workflow = {
  id: 'send-email',
  description: 'Sends an email',
  steps: [
    {
      name: 'send-email',
      run: sendEmailHandler,
    },
  ],
}

export const sendEmailWorkflow = {
  workflow: sendEmailWorkflowHandler,
  payload: zSendEmailWorkflowPayload,
} satisfies WorkflowRegistryEntry
