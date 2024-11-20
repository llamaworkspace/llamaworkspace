import { GoogleSvg } from '@/components/ui/icons/Google'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

interface SignInGoogleProps {
  callbackUrl?: string
  isDemoMode?: boolean
}

export const SignInGoogle = ({
  callbackUrl,
  isDemoMode,
}: SignInGoogleProps) => {
  const searchParams = useSearchParams()

  const queryCallbackUrl =
    callbackUrl ?? (searchParams?.get('callbackUrl') as string | undefined)

  const handleSignIn = async () => {
    await signIn('google', {
      callbackUrl: getSanitizedCallbackUrl(queryCallbackUrl, '/p'),
    })
  }

  const buttonEl = (
    <div className={cn(isDemoMode && 'opacity-50')}>
      <button
        onClick={() => void handleSignIn()}
        disabled={isDemoMode}
        className={cn(
          'focus-visible:button-focus-outline relative flex w-full min-w-[60px] flex-row items-center justify-center space-x-1  rounded-lg bg-white px-3 py-4 text-sm font-medium text-zinc-700 shadow ring-1 ring-black/5 transition hover:bg-zinc-50 focus:outline-none disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-white',
          isDemoMode && 'cursor-not-allowed',
        )}
      >
        <GoogleSvg />
        <span className="relative whitespace-nowrap text-zinc-800">
          Continue with Google
        </span>
      </button>
    </div>
  )

  if (!isDemoMode) {
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
