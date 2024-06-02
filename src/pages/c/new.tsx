import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { getDefaultPostService } from '@/server/apps/services/getDefaultPost.service'
import { getServerAuthSession } from '@/server/auth/nextauth'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { createChatService } from '@/server/chats/services/createChat.service'
import { prisma } from '@/server/db'
import type { GetServerSideProps, GetServerSidePropsContext } from 'next'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { query } = context
  const { workspaceId } = query

  const session = await getServerAuthSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  if (!workspaceId) {
    return {
      redirect: {
        destination: '/p',
        permanent: false,
      },
    }
  }

  const userId = session.user.id

  const ctx = await createUserOnWorkspaceContext(
    prisma,
    workspaceId as string,
    userId,
  )
  const app = await getDefaultPostService(prisma, ctx)
  const result = await createChatService(prisma, ctx, {
    appId: app.id,
  })

  return { redirect: { destination: `/c/${result.id}`, permanent: false } }
}

export default function ChatNewPage() {
  return <MainLayout variant={HeaderVariants.Hidden} />
}
