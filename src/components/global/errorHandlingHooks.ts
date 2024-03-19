import { type rootRouter } from '@/server/trpc/rootRouter'
import { errorLogger } from '@/shared/errors/errorLogger'
import { TRPCClientError } from '@trpc/client'
import { useErrorToast } from '../ui/toastHooks'
import {
  AppClientError,
  type AppHttpErrorPayload,
} from './components/AppClientError'

const DEFAULT_ERROR_MESSAGE =
  'An unexpected error just happened. Please try again.'

export const useErrorHandler = () => {
  const toast = useErrorToast()

  return (message?: string) => (error: unknown) => {
    message = message ?? DEFAULT_ERROR_MESSAGE
    const asError = error as Error

    // Case 1: TRPCClientError
    if (error instanceof TRPCClientError) {
      const trpcClientError = error as TRPCClientError<typeof rootRouter>
      return handleAsTrpcClientError(trpcClientError, toast)
    }

    // Case 2: Either AppClientError, or some other error
    let appError: AppClientError
    try {
      appError = buildAppClientErrorOrThrow(asError)
      return handleAsAppClientError(appError, toast)
    } catch (_e) {
      toast(DEFAULT_ERROR_MESSAGE)
      errorLogger(asError)
    }
  }
}

const buildAppClientErrorOrThrow = (error: Error) => {
  let json: Record<string, unknown>
  try {
    json = JSON.parse(error.message) as Record<string, unknown>
  } catch (jsonParseError) {
    throw new Error("Couldn't parse error message as JSON")
  }

  if (json.isAppError === true) {
    const appJson = json as unknown as AppHttpErrorPayload
    return new AppClientError(appJson.code, appJson.message)
  }

  throw new Error('The error is not an AppError')
}

const handleAsTrpcClientError = (
  trpcClientError: TRPCClientError<typeof rootRouter>,
  toast: ReturnType<typeof useErrorToast>,
) => {
  const errorPayload = trpcClientError.data

  if (errorPayload?.httpStatus && errorPayload.httpStatus >= 500) {
    errorLogger(trpcClientError)
    return toast(DEFAULT_ERROR_MESSAGE)
  }

  if (errorPayload?.zodError) {
    errorLogger(trpcClientError)
    return toast(
      "There was an unexpected error validating your input. We'll look into it so that it does not happen again.",
    )
  }

  return toast(trpcClientError.message)
}

const handleAsAppClientError = (
  appClientError: AppClientError,
  toast: ReturnType<typeof useErrorToast>,
) => {
  return toast(appClientError.message)
}
