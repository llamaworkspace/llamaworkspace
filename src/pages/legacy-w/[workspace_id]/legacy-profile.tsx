import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { Profile } from '@/components/users/components/Profile'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const params = useParams<{ app_id: string }>()

  const appId = params?.app_id

  return (
    <MainLayout variant={HeaderVariants.Hidden} appId={appId}>
      <Profile />
    </MainLayout>
  )
}
