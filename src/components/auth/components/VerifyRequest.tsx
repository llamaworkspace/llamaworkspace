import { Button } from '@/components/ui/button'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export const VerifyRequest = () => {
  const router = useRouter()
  const handleBack = () => {
    void router.back()
  }
  return (
    <>
      <Head>
        <title>Verify request | Llama Workspace</title>
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
                We have sent you a login link
              </h1>
              <p className="text-muted-foreground ">
                Check your Inbox, you&apos;ll find an email sent from us. Click
                on the link inside the email and we will log you in
                automatically.
              </p>
            </div>
            <p className="pt-4">
              <Button onClick={handleBack} variant="outline">
                &larr; Back to login page
              </Button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
