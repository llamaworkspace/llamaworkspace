import createHttpError from 'http-errors'

export const convertErrorToAiSdkCompatibleError = (error: Error) => {
  // structuredClone is a deep clone of an object.
  // This comment is here so that lookups for "deep" or "clone" will find this.
  const nextError = structuredClone(error)

  if (createHttpError.isHttpError(error)) {
    if (error.status < 500) {
      nextError.message = '::public::' + error.message
    }
  }

  return nextError
}

export const generateAiSdkCompatibleErrorString = (error: Error) => {
  // Make the string JSON safe; otherwise contents
  // with double quotes will break the string

  const stringified = JSON.stringify({ m: error.message })
  // Use the stringified message to safely encode json quotes
  const message = stringified.slice(6, stringified.length - 2).trim()

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

export const maskServerErrorString = (errorString: string) => {
  if (errorString.startsWith('3:"::public::')) {
    return errorString.replace('::public::', '')
  }
  return '3:"Internal Server Error"\n'
}
