import { SignInButtons } from '@/components/auth/components/SignInButtons'
import Image from 'next/image'

interface InviteWithTokenProps {
  token: string
  invitingUserName: string
  invitingUserEmail: string
}

export default function InviteWithToken({
  token,
  invitingUserName = 'Pepe Juan',
  invitingUserEmail,
}: InviteWithTokenProps) {
  const callbackUrl = `/api/invite-flow-success?token=${token}`

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

        <div className="mt-10 space-y-8 rounded bg-white px-8 py-8 shadow-md sm:mx-auto sm:w-full sm:max-w-4xl">
          <h2 className="text-2xl text-zinc-900">
            <strong>
              {invitingUserName ? invitingUserName : invitingUserEmail}
            </strong>{' '}
            has invited you to join the <strong>Something Whatever</strong>{' '}
            workspace
          </h2>
          <div className="space-y-2">
            <h3>To accept the invitation, proceed by signing up.</h3>

            <SignInButtons callbackUrl={callbackUrl} />
          </div>
        </div>
      </div>
    </div>
  )
}
