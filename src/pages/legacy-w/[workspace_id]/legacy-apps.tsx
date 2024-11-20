import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { AppsList } from '@/components/workspaces/components/Apps/AppsList'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const params = useParams<{ app_id: string }>()

  const appId = params?.app_id

  return (
    <MainLayout variant={HeaderVariants.Hidden} appId={appId}>
      <AppsList />
    </MainLayout>
  )
}
