import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { AppsList } from '@/components/workspaces/components/Apps/AppsList'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function ProfilePage() {
  const navigation = useNavigation()
  const query = navigation.query

  const postId = query.post_id as string | undefined

  return (
    <MainLayout variant={HeaderVariants.Hidden} postId={postId}>
      <AppsList />
    </MainLayout>
  )
}
