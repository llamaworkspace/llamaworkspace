import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { Profile } from '@/components/users/components/Profile'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function ProfilePage() {
  const navigation = useNavigation()
  const query = navigation.query

  const appId = query.app_id as string | undefined

  return (
    <MainLayout variant={HeaderVariants.Hidden} appId={appId}>
      <Profile />
    </MainLayout>
  )
}
