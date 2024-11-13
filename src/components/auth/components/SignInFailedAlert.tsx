'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useSearchParams } from 'next/navigation'

const errorMessages = {
  OAuthAccountNotLinked:
    'This account is already linked with another sign-in method. Please sign in with the same method you used to create this account.',
  default:
    'There was a system error signing you in. Please try again or contact the administrator.',
}

export function SignInFailedAlert() {
  const searchParams = useSearchParams()

  if (!searchParams.get('error')) {
    return null
  }

  return (
    <Alert variant="danger">
      <AlertTitle>Sign in failed</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          {errorMessages[
            searchParams.get('error') as keyof typeof errorMessages
          ] ?? errorMessages.default}
        </p>{' '}
        <p className="text-xs">Error code: {searchParams.get('error')}</p>
      </AlertDescription>
    </Alert>
  )
}

function getSanitizedCallbackUrl(
  rawCallbackUrl: string | null,
  defaultUrl: string,
) {
  if (!rawCallbackUrl) {
    return defaultUrl
  }

  if (rawCallbackUrl.startsWith('/')) {
    return rawCallbackUrl
  }

  if (new URL(rawCallbackUrl).origin === window?.location.origin) {
    return rawCallbackUrl
  }

  return defaultUrl
}
