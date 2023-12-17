import { MainLayout } from '@/components/layout/MainLayout'
import { Profile } from '@/components/users/components/Profile'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function ProfilePage() {
  const navigation = useNavigation()
  const query = navigation.query

  const postId = query.post_id as string | undefined

  return (
    <MainLayout hideHeader postId={postId}>
      <Profile />
    </MainLayout>
  )
}
