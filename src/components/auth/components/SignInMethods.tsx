"use client"

import { signIn } from 'next-auth/react'
import * as React from 'react'
import { Field, Form as FinalForm } from 'react-final-form'
import { SignInGoogle } from './SignInGoogle'
import { useSearchParams } from 'next/navigation'
import { composeValidators, stringRequired, email } from '@/lib/frontend/final-form-validations'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/forms/InputField'
import { SpinnerIcon } from '@/components/ui/icons/SpinnerIcon'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'



interface UserAuthFormValues {
  email: string
}

const errorMessages = {
  OAuthAccountNotLinked:
    'This account is already linked with another sign-in method. Please sign in with the same method you used to create this account.',
  default:
    'There was a system error signing you in. Please try again or contact the administrator.',
}

interface SignInMethodsProps {
  callbackUrl?: string
  isDemoMode?: boolean
}

export function SignInMethods({ callbackUrl, isDemoMode }: SignInMethodsProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const searchParams = useSearchParams()
  const queryCallbackUrl =
    callbackUrl ?? searchParams.get('callbackUrl')

  const handleEmailFormSubmit = async (values: UserAuthFormValues) => {
    setIsLoading(true)
    if (isDemoMode) {
      alert(
        'Emails are disabled in demo mode. To log in, go to your terminal and copy/paste the magic link provided.',
      )
    }
    await signIn('email', {
      email: values.email,
      callbackUrl: getSanitizedCallbackUrl(queryCallbackUrl, '/p'),
    })
    setIsLoading(false)
  }

  return (
    <div className="grid gap-6">
      {searchParams.get('error') && (
        <Alert variant="danger">
          <AlertTitle>Sign in failed</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              {errorMessages[searchParams.get('error') as keyof typeof errorMessages] ??
                errorMessages.default}
            </p>{' '}
            <p className="text-xs">Error code: {searchParams.get('error')}</p>
          </AlertDescription>
        </Alert>
      )}
      <SignInGoogle callbackUrl={callbackUrl} isDemoMode={isDemoMode} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="text-muted-foreground bg-white px-2">
            Or continue with email
          </span>
        </div>
      </div>
      <FinalForm<UserAuthFormValues>
        onSubmit={handleEmailFormSubmit}
        render={({ handleSubmit }) => {
          return (
            <form
              onSubmit={(ev) => {
                ev.preventDefault()
                void handleSubmit()
              }}
            >
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <Field
                    name="email"
                    validate={composeValidators(stringRequired, email)}
                    render={({ input, meta }) => {
                      return (
                        <InputField
                          meta={meta}
                          placeholder="name@example.com"
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          {...input}
                        />
                      )
                    }}
                  />
                </div>
                <Button disabled={isLoading}>
                  {isLoading && (
                    <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  Sign In with Email
                </Button>
              </div>
            </form>
          )
        }}
      />
    </div>
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
