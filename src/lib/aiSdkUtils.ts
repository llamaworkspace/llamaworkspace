import createHttpError from 'http-errors'

export const generateAiSdkCompatibleErrorString = (error: Error) => {
  if (createHttpError.isHttpError(error)) {
    if (error.status < 500) {
      return `3:"::public::${error.message}"\n`
    }
  }
  return `3:"${error.message}"\n`
}

export const isAiSdkErrorString = (errorString: string) => {
  if (errorString.startsWith('3:')) {
    return true
  }
  return false
}
