import { getServerAuthSession } from '@/server/auth/nextauth'
import { prisma } from '@/server/db'
import type { GetServerSideProps, GetServerSidePropsContext } from 'next'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { query } = context
  const { workspace_id } = query

  const session = await getServerAuthSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspace_id as string,
      users: {
        some: {
          userId: session?.user.id,
        },
      },
    },
  })

  if (!workspace) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  if (workspace?.onboardingCompletedAt) {
    return { redirect: { destination: `/p`, permanent: false } }
  }

  return {
    redirect: {
      destination: `/w/${workspace.id}/onboarding/1`,
      permanent: false,
    },
  }
}

export default function OnboardingIndex() {
  return null
}
