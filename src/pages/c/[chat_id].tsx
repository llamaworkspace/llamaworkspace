import { Chat } from '@/components/chats/Chat'
import { useChatById } from '@/components/chats/chatHooks'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { PostError } from '@/components/posts/components/PostError'
import { useDefaultPost } from '@/components/posts/postsHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function ChatPage() {
  const navigation = useNavigation()

  const query = navigation.query
  const chatId = query.chat_id as string | undefined
  const { data: chat, isLoading: chatIsLoading } = useChatById(chatId)
  const { data: post, isLoading: postIsLoading } = useDefaultPost()

  let isPostOrChatInvalid = false
  if (!postIsLoading && !chatIsLoading) {
    if (!post || !chat) {
      isPostOrChatInvalid = true
    }
  }

  return (
    <MainLayout postId={post?.id} chatId={chatId} variant={HeaderVariants.Chat}>
      {!isPostOrChatInvalid && <Chat postId={post?.id} chatId={chatId} />}
      {isPostOrChatInvalid && <PostError />}
    </MainLayout>
  )
}
