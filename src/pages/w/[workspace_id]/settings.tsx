import { MainLayout } from '@/components/layout/MainLayout'
import { Settings } from '@/components/workspaces/components/Settings'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function SettingsPage() {
  const navigation = useNavigation()
  const query = navigation.query

  const postId = query.post_id as string | undefined

  return (
    <MainLayout hideHeader postId={postId}>
      <Settings />
    </MainLayout>
  )
}
