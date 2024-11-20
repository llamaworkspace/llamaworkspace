import { useDefaultPageRedirection } from '@/components/global/redirectionHooks'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { useEffect } from 'react'

// Delete me when we are in app router, also the inner hook
export const GlobalRedirector = () => {
  const { redirect } = useDefaultPageRedirection()

  useEffect(() => {
    redirect?.()
  }, [redirect])

  return <MainLayout variant={HeaderVariants.Hidden} />
}
