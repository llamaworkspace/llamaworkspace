import Head from 'next/head'
import Image from 'next/image'
import { SignInButtons } from './SignInButtons'

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

        <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white p-12 shadow sm:rounded-lg sm:px-12">
            <h2 className="mb-4 text-center text-2xl font-bold leading-9 tracking-tight text-zinc-900">
              Log in to continue
            </h2>
            <SignInButtons />
          </div>
        </div>
      </div>
    </>
  )
}
