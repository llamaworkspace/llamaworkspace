import { useNavigation } from '@/lib/frontend/useNavigation'
import { signIn } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import { useLatestWorkspaceIdLocalStorage } from '../global/localStorageHooks'
import { GoogleSvg } from '../ui/icons/Google'

export const SignIn = () => {
  return (
    <>
      <Head>
        <title>Sign In | Joia</title>
      </Head>
      <div className="flex min-h-full flex-1 flex-col bg-zinc-100 py-12 sm:px-6 lg:px-8">
        <div className="mb-9 mt-16 sm:mx-auto sm:w-full sm:max-w-md">
          <Image
            className="mx-auto h-10 w-auto"
            src="/images/joia_logo_red.svg"
            alt="Joia"
            width="47"
            height="40"
          />
        </div>

        <ContinueWithGoogle />
      </div>
    </>
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

const ContinueWithGoogle = () => {
  const navigation = useNavigation()
  const [, , clearLastWorkspaceId] = useLatestWorkspaceIdLocalStorage()
  const queryCallbackUrl = navigation.query?.callbackUrl as string | undefined

  const callbackUrl = getSanitizedCallbackUrl(queryCallbackUrl, '/p')

  const handleSignIn = async () => {
    clearLastWorkspaceId()
    await signIn('google', { callbackUrl })
  }

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
      <div className="bg-white p-12 shadow sm:rounded-lg sm:px-12">
        <h2 className="mb-4 text-center text-2xl font-bold leading-9 tracking-tight text-zinc-900">
          Log in to continue
        </h2>
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
      </div>
    </div>
  )
}
