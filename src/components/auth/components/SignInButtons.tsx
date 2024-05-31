import { GoogleSvg } from '@/components/ui/icons/Google'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { signIn } from 'next-auth/react'

interface SignInButtonsProps {
  callbackUrl?: string
}

export const SignInButtons = ({ callbackUrl }: SignInButtonsProps) => {
  const navigation = useNavigation()
  const queryCallbackUrl =
    callbackUrl ?? (navigation.query?.callbackUrl as string | undefined)

  const handleSignIn = async () => {
    await signIn('google', {
      callbackUrl: getSanitizedCallbackUrl(queryCallbackUrl, '/p'),
    })
  }
  return (
    <div>
      <button
        onClick={() => void handleSignIn()}
        className="focus-visible:button-focus-outline relative flex w-full min-w-[60px] flex-row items-center justify-center space-x-1  rounded-lg bg-white px-3 py-4 text-sm font-medium text-zinc-700 shadow ring-1 ring-black/5 transition hover:bg-zinc-50 focus:outline-none disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-white"
      >
        <GoogleSvg />
        <span className="relative whitespace-nowrap text-zinc-800">
          Continue with Google
        </span>
      </button>
    </div>
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
