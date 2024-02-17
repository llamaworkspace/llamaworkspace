import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { GoogleSvg } from '../ui/icons/Google'

interface InviteWithTokenProps {
  token: string
  invitingUserName: string
  invitingUserEmail: string
  targetPostName?: string | null
}

export default function InviteWithToken({
  token,
  invitingUserName,
  invitingUserEmail,
  targetPostName,
}: InviteWithTokenProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100 py-12 sm:px-6 lg:px-8">
      <div className="mt-16 space-y-2 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          className="mx-auto mb-8 h-10 w-auto"
          src="/images/joia_logo_red.svg"
          alt="Joia"
          width="47"
          height="40"
        />

        <h2 className="mt-6  text-2xl font-bold leading-9 tracking-tight text-zinc-900">
          {invitingUserName ? invitingUserName : invitingUserEmail} has shared
          you access to{!targetPostName && ' a Joia post'}
        </h2>
        <div className="text-xl">{targetPostName}</div>
      </div>

      <ContinueWithGoogle token={token} />
    </div>
  )
}

const ContinueWithGoogle = ({ token }: { token: string }) => {
  return (
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
        <button
          onClick={() =>
            void signIn('google', {
              callbackUrl: `/api/invites/invite-flow-success?token=${token}`,
            })
          }
          className="focus-visible:button-focus-outline relative flex w-full min-w-[60px] flex-row items-center justify-center space-x-1  rounded-lg bg-white px-3 py-4 text-sm font-medium text-zinc-700 shadow ring-1 ring-black/5 transition hover:bg-zinc-50 focus:outline-none disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-white"
        >
          <GoogleSvg />
          <span className="relative whitespace-nowrap text-zinc-800">
            Continue with Google
          </span>
        </button>
      </div>
    </div>
  )
}
