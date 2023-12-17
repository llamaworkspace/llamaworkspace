import { useDefaultPageRedirection } from '@/components/global/redirectionHooks'
import { MainLayout } from '@/components/layout/MainLayout'
import { useEffect } from 'react'

export default function AppIndexPage() {
  const { redirect } = useDefaultPageRedirection()

  useEffect(() => {
    redirect?.()
  }, [redirect])

  return <MainLayout hideHeader={true} />
}
