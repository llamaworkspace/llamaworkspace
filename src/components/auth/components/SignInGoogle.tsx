import { GoogleSvg } from '@/components/ui/icons/Google'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { env } from '@/env.mjs'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'

const { NEXT_PUBLIC_DEMO_MODE } = env

const isDemo = NEXT_PUBLIC_DEMO_MODE === 'true'

interface SignInGoogleProps {
  callbackUrl?: string
}

export const SignInGoogle = ({ callbackUrl }: SignInGoogleProps) => {
  const navigation = useNavigation()
  const queryCallbackUrl =
    callbackUrl ?? (navigation.query?.callbackUrl as string | undefined)

  const handleSignIn = async () => {
    await signIn('google', {
      callbackUrl: getSanitizedCallbackUrl(queryCallbackUrl, '/p'),
    })
  }

  const buttonEl = (
    <div className={cn(isDemo && 'opacity-50')}>
      <button
        onClick={() => void handleSignIn()}
        disabled={isDemo}
        className={cn(
          'focus-visible:button-focus-outline relative flex w-full min-w-[60px] flex-row items-center justify-center space-x-1  rounded-lg bg-white px-3 py-4 text-sm font-medium text-zinc-700 shadow ring-1 ring-black/5 transition hover:bg-zinc-50 focus:outline-none disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-white',
          isDemo && 'cursor-not-allowed',
        )}
      >
        <GoogleSvg />
        <span className="relative whitespace-nowrap text-zinc-800">
          Continue with Google
        </span>
      </button>
    </div>
  )

  if (!isDemo) {
    return buttonEl
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{buttonEl}</TooltipTrigger>
      {/* mr-2 ensures that the tooltip does not stick to the right of the browser */}
      <TooltipContent className="mr-2">
        <p>Google sign-in is disbled in demo mode.</p>
      </TooltipContent>
    </Tooltip>
  )
}

function getSanitizedCallbackUrl(
  rawCallbackUrl: string | undefined,
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
