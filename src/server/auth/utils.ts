import { ensureError } from '@/lib/utils'
import { errorLogger } from '@/shared/errors/errorLogger'
import { SendVerificationRequestParams } from 'next-auth/providers/email'
import { EmailService } from '../messaging/EmailService'

export const sendVerificationRequestForEmailProvider = async (
  params: SendVerificationRequestParams,
) => {
  try {
    const { identifier, url, provider } = params

    // Hack derived from callbackUrl actually existing in the provider object
    const { callbackUrl } = provider as unknown as { callbackUrl: string }
    if (!callbackUrl) {
      throw new Error('Missing callbackUrl')
    }
    const { host } = new URL(url)

    const emailService = new EmailService()

    await emailService.send({
      to: identifier,
      templateName: 'magicLink',
      payload: { targetUrl: 'https://joia.so' },
    })
  } catch (error) {
    errorLogger(ensureError(error))
    throw error
  }
}
