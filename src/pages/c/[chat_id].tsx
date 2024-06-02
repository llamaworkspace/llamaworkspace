import { useChatById } from '@/components/chats/chatHooks'
import { Chat } from '@/components/chats/components/Chat'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { PostError } from '@/components/posts/components/PostError'
import { usePostById } from '@/components/posts/postsHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function ChatPage() {
  const navigation = useNavigation()

  const query = navigation.query
  const chatId = query.chat_id as string | undefined
  const { data: chat, isLoading: chatIsLoading } = useChatById(chatId)
  const { data: app, isLoading: postIsLoading } = usePostById(chat?.appId)

  const isLoadingCompleted = !!(chat && app)
  const isDefaultPost = isLoadingCompleted && app.isDefault

  let isPostOrChatInvalid = false
  if (!postIsLoading && !chatIsLoading) {
    if (!app || !chat) {
      isPostOrChatInvalid = true
    }
  }

  let variant: HeaderVariants = HeaderVariants.Hidden
  if (isLoadingCompleted) {
    variant = isDefaultPost ? HeaderVariants.Chat : HeaderVariants.Chatbot
  }

  return (
    <MainLayout appId={app?.id} chatId={chatId} variant={variant}>
      {/* Apply a key to force full remounts; otherwise nested effects might not work... Nextjs related */}
      {!isPostOrChatInvalid && (
        <Chat appId={app?.id} chatId={chatId} key={navigation.asPath} />
      )}
      {isPostOrChatInvalid && <PostError />}
    </MainLayout>
  )
}
