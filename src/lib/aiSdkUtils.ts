import createHttpError from 'http-errors'

export const generateAiSdkCompatibleErrorString = (error: Error) => {
  // Make the string JSON safe; otherwise contents
  // with double quotes will break the string
  const message = error.message.replace(/"/g, '\\"')

  if (createHttpError.isHttpError(error)) {
    if (error.status < 500) {
      return `3:"::public::${message}"\n`
    }
  }
  return `3:"${message}"\n`
}

export const isAiSdkErrorString = (errorString: string) => {
  if (errorString.startsWith('3:')) {
    return true
  }
  return false
}
