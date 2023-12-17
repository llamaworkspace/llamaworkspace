import { Chat } from '@/components/chats/Chat'
import { useChatById } from '@/components/chats/chatHooks'
import { MainLayout } from '@/components/layout/MainLayout'
import { PostError } from '@/components/posts/components/PostError'
import { usePostById } from '@/components/posts/postsHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function ChatPage() {
  const navigation = useNavigation()
  const query = navigation.query
  const postId = query.post_id as string | undefined
  const chatId = query.chat_id as string | undefined
  const { data: post, isLoading: postIsLoading } = usePostById(postId)
  const { data: chat, isLoading: chatIsLoading } = useChatById(chatId)

  let isPostOrChatInvalid = false
  if (!postIsLoading && !chatIsLoading) {
    if (!post || !chat) {
      isPostOrChatInvalid = true
    }
  }

  return (
    <MainLayout postId={postId} hideHeader={isPostOrChatInvalid}>
      {!isPostOrChatInvalid && <Chat postId={postId} chatId={chatId} />}
      {isPostOrChatInvalid && <PostError />}
    </MainLayout>
  )
}
