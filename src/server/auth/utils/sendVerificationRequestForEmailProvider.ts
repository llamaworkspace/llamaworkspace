import { env } from '@/env.mjs'
import { ensureError } from '@/lib/utils'
import { errorLogger } from '@/shared/errors/errorLogger'
import type { SendVerificationRequestParams } from 'next-auth/providers/email'
import { EmailService } from '../../messaging/EmailService'

const isDemo = env.NEXT_PUBLIC_DEMO_MODE === 'true'
const isDev = env.NODE_ENV === 'development'

const logLinkToConsole = (url: string) => {
  console.info('')
  console.info('****** Log in using the following link ******')
  console.info('')
  console.info(url)
  console.info('')
  console.info('*********************************************')
  console.info('')
}

export const sendVerificationRequestForEmailProvider = async (
  params: SendVerificationRequestParams,
) => {
  if (isDemo) {
    return logLinkToConsole(params.url)
  }

  if (isDev) {
    logLinkToConsole(params.url)
  }

  try {
    const { identifier, url } = params

    const emailService = new EmailService()

    await emailService.send({
      to: identifier,
      templateName: 'magicLink',
      payload: { targetUrl: url },
    })
  } catch (error) {
    // This error isn't captured elsewhere, so we log it here
    errorLogger(ensureError(error))
    throw error
  }
}
