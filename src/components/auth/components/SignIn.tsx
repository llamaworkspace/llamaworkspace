import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { SignInMethods } from './SignInMethods'

export const SignIn = ({ isDemoMode }: { isDemoMode?: boolean }) => {
  return (
    <>
      <Head>
        <title>Sign In | Llama Workspace</title>
      </Head>
      <div className="mx-auto flex h-full px-4">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-4 text-center">
            <Image
              alt="Llama Workspace logo"
              src="/images/llama-workspace-logo-black-square.svg"
              width="72"
              height="72"
              className="self-center"
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Identify yourself to get started
              </h1>
              <p className="text-muted-foreground text-sm">
                We&apos;ll log you in if you already have an account, or sign
                you up if you&apos;re new.
              </p>

              <SignInMethods isDemoMode={isDemoMode} />
              <p className="text-muted-foreground px-8 text-center text-sm">
                By clicking continue, you agree to our{' '}
                <Link
                  href="https://llamaworkspace.ai/blog/privacy-policy"
                  className="hover:text-primary underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
