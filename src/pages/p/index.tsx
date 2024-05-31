import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { getServerAuthSession } from '@/server/auth/nextauth'
import { prisma } from '@/server/db'
import { getEntrypointRedirectUrlService } from '@/server/global/services/getEntrypointRedirectUrl.service'
import type { GetServerSideProps, GetServerSidePropsContext } from 'next'

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

  const { url } = await getEntrypointRedirectUrlService(prisma, userId)

  return {
    redirect: {
      destination: url,
      permanent: false,
    },
  }
}

export default function AppIndexPage() {
  return <MainLayout variant={HeaderVariants.Hidden} />
}
