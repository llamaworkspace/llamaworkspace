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
  params: unknown,
) => {
  console.log('sendVerificationRequestForEmailProvider', params)
  // if (isDemoMode) {
  //   return logLinkToConsole(params.url)
  // }

  // if (isDevelopment) {
  //   logLinkToConsole(params.url)
  // }

  // try {
  //   const { identifier, url } = params

  //   const emailService = new EmailService()

  //   await emailService.send({
  //     to: identifier,
  //     templateName: 'magicLink',
  //     payload: { targetUrl: url },
  //   })
  // } catch (error) {
  //   // This error isn't captured elsewhere, so we log it here
  //   errorLogger(ensureError(error))
  //   throw error
  // }
}
