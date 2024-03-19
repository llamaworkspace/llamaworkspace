import { useDefaultPageRedirection } from '@/components/global/redirectionHooks'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { useEffect } from 'react'

export default function AppIndexPage() {
  const { redirect } = useDefaultPageRedirection()

  useEffect(() => {
    redirect?.()
  }, [redirect])

  return <MainLayout variant={HeaderVariants.Hidden} />
}
