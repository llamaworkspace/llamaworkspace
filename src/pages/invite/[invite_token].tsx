import InviteWithToken from '@/components/invites/InviteWithToken'
import { prisma } from '@/server/db'
import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.query.invite_token as string

  try {
    const data = await prisma.invite.findFirstOrThrow({
      where: {
        token,
      },
      include: {
        invitedBy: true,
        postShare: {
          include: {
            post: true,
          },
        },
      },
    })

    const invitingUserName = data.invitedBy.name
    const invitingUserEmail = data.invitedBy.email
    const targetPostName = data.postShare?.post?.title

    return {
      props: { token, invitingUserName, invitingUserEmail, targetPostName },
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
  targetPostName?: string | null
}

export default function InviteWithTokenPage({
  token,
  invitingUserName,
  invitingUserEmail,
  targetPostName,
}: InviteWithTokenPageProps) {
  return (
    <InviteWithToken
      token={token}
      invitingUserEmail={invitingUserEmail}
      invitingUserName={invitingUserName}
      targetPostName={targetPostName}
    />
  )
}
