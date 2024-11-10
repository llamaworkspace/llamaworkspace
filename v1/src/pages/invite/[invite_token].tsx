import InviteWithToken from '@/components/invites/InviteWithToken'
import { env } from '@/env.mjs'
import { prisma } from '@/server/db'
import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.query.invite_token as string

  try {
    const data = await prisma.workspaceInvite.findFirstOrThrow({
      where: {
        token,
      },
      include: {
        invitedBy: true,
        workspace: true,
      },
    })

    const invitingUserName = data.invitedBy.name
    const invitingUserEmail = data.invitedBy.email
    const workspaceName = data.workspace.name
    const isDemoMode = env.DEMO_MODE === 'true'

    return {
      props: {
        token,
        invitingUserName,
        invitingUserEmail,
        workspaceName,
        isDemoMode,
      },
    }
  } catch (error) {
    // Todo: handle cases. Understand if sentry picks this up by default.
    return { notFound: true }
  }
}

interface InviteWithTokenPageProps {
  token: string
  invitingUserName: string
  invitingUserEmail: string
  workspaceName: string
  isDemoMode: boolean
}

export default function InviteWithTokenPage({
  token,
  invitingUserName,
  invitingUserEmail,
  workspaceName,
  isDemoMode,
}: InviteWithTokenPageProps) {
  return (
    <InviteWithToken
      token={token}
      invitingUserEmail={invitingUserEmail}
      invitingUserName={invitingUserName}
      workspaceName={workspaceName}
      isDemoMode={isDemoMode}
    />
  )
}
