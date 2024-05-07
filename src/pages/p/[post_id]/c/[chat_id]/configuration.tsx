import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { PostConfig } from '@/components/posts/components/PostConfig/PostConfig'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function PostConfigPage() {
  const navigation = useNavigation()
  const query = navigation.query

  const postId = query.post_id as string | undefined
  const chatId = query.chat_id as string | undefined

  return (
    <MainLayout
      postId={postId}
      chatId={chatId}
      variant={HeaderVariants.Chatbot}
    >
      <PostConfig postId={postId} />
    </MainLayout>
  )
}
