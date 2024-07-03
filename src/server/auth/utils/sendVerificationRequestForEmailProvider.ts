import { ensureError } from '@/lib/utils'
import { errorLogger } from '@/shared/errors/errorLogger'
import { SendVerificationRequestParams } from 'next-auth/providers/email'
import { EmailService } from '../../messaging/EmailService'

export const sendVerificationRequestForEmailProvider = async (
  params: SendVerificationRequestParams,
) => {
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
