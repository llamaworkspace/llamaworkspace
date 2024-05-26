import { useChatById } from 'components/chats/chatHooks'
import { Chat } from 'components/chats/components/Chat'
import { MainLayout } from 'components/layout/MainLayout'
import { HeaderVariants } from 'components/layout/MainLayout/MainLayoutHeader'
import { PostError } from 'components/posts/components/PostError'
import { usePostById } from 'components/posts/postsHooks'
import { useNavigation } from 'lib/frontend/useNavigation'

export default function ChatPage() {
  const navigation = useNavigation()

  const query = navigation.query
  const chatId = query.chat_id as string | undefined
  const { data: chat, isLoading: chatIsLoading } = useChatById(chatId)
  const { data: post, isLoading: postIsLoading } = usePostById(chat?.postId)

  const isLoadingCompleted = !!(chat && post)
  const isDefaultPost = isLoadingCompleted && post.isDefault

  let isPostOrChatInvalid = false
  if (!postIsLoading && !chatIsLoading) {
    if (!post || !chat) {
      isPostOrChatInvalid = true
    }
  }

  let variant: HeaderVariants = HeaderVariants.Hidden
  if (isLoadingCompleted) {
    variant = isDefaultPost ? HeaderVariants.Chat : HeaderVariants.Chatbot
  }

  return (
    <MainLayout postId={post?.id} chatId={chatId} variant={variant}>
      {/* Apply a key to force full remounts; otherwise nested effects might not work... Nextjs related */}
      {!isPostOrChatInvalid && (
        <Chat postId={post?.id} chatId={chatId} key={navigation.asPath} />
      )}
      {isPostOrChatInvalid && <PostError />}
    </MainLayout>
  )
}
