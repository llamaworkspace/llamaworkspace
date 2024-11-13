'use client'

import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/forms/InputField'
import { SpinnerIcon } from '@/components/ui/icons/SpinnerIcon'
import {
  composeValidators,
  email,
  stringRequired,
} from '@/lib/frontend/final-form-validations'
import { useSearchParams } from 'next/navigation'
import { Suspense, useTransition } from 'react'
import { Field, Form as FinalForm } from 'react-final-form'
import { emailSignInAction } from '../actions/authActions'
import { SignInFailedAlert } from './SignInFailedAlert'
import { SignInGoogle } from './SignInGoogle'

interface UserAuthFormValues {
  email: string
}

interface SignInMethodsProps {
  callbackUrl?: string
  isDemoMode?: boolean
}

export function SignInMethods({ callbackUrl, isDemoMode }: SignInMethodsProps) {
  return (
    <Suspense>
      <SignInMethodsBody callbackUrl={callbackUrl} isDemoMode={isDemoMode} />
    </Suspense>
  )
}

export function SignInMethodsBody({
  callbackUrl,
  isDemoMode,
}: SignInMethodsProps) {
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const queryCallbackUrl = callbackUrl ?? searchParams.get('callbackUrl')

  const handleEmailFormSubmit = async (values: UserAuthFormValues) => {
    if (isDemoMode) {
      alert(
        'Emails are disabled in demo mode. To log in, go to your terminal and copy/paste the magic link provided.',
      )
      return
    }

    startTransition(async () => {
      await emailSignInAction(
        values.email,
        getSanitizedCallbackUrl(queryCallbackUrl, '/p'),
      )
    })
  }

  return (
    <div className="grid gap-6">
      <SignInFailedAlert />
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
                <Button disabled={isPending}>
                  {isPending && (
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
