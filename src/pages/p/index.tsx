import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { getServerAuthSession } from '@/server/auth/nextauth'
import { prisma } from '@/server/db'
import { getEntrypointRedirectUrl } from '@/server/global/services/getEntrypointRedirectUrl.service'
import type { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const session = await getServerAuthSession(context)
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }
  const userId = session?.user.id

  const { url } = await getEntrypointRedirectUrl(prisma, userId)
  console.log('url', url)
  return {
    redirect: {
      destination: url,
      permanent: false,
    },
  }
}

export default function AppIndexPage() {
  const { replace } = useRouter()
  const { workspace } = useCurrentWorkspace()

  useEffect(() => {
    async function doRedirect() {
      if (!workspace) return
      const url = `/c/new?workspaceId=${workspace.id}`
      await replace(url)
    }
    // void doRedirect()
  }, [workspace, replace])
  return <div>work in progress</div>
  return <MainLayout variant={HeaderVariants.Hidden} />
}
