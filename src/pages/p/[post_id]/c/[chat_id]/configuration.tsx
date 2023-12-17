import { MainLayout } from '@/components/layout/MainLayout'
import { PostConfig } from '@/components/posts/components/PostConfig'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function PostConfigPage() {
  const navigation = useNavigation()
  const query = navigation.query

  const postId = query.post_id as string | undefined
  return (
    <MainLayout postId={postId}>
      <PostConfig postId={postId} />
    </MainLayout>
  )
}
