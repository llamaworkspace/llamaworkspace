import { PostError } from '@/components/apps/components/PostError'
import { useDefaultPost, usePostById } from '@/components/apps/postsHooks'
import { useChatById } from '@/components/chats/chatHooks'
import { Chat } from '@/components/chats/components/Chat'
import { MainLayout } from '@/components/layout/MainLayout'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useEffect } from 'react'
import { HeaderVariants } from '../../../../../components/layout/MainLayout/MainLayoutHeader'

export default function ChatPage() {
  const navigation = useNavigation()
  const query = navigation.query
  const appId = query.post_id as string | undefined
  const chatId = query.chat_id as string | undefined
  const { data: app, isLoading: postIsLoading } = usePostById(appId)
  const { data: chat, isLoading: chatIsLoading } = useChatById(chatId)
  const { data: defaultPost, isLoading: defaultPostIsLoading } =
    useDefaultPost()

  let isPostOrChatInvalid = false
  if (!postIsLoading && !chatIsLoading) {
    if (!app || !chat) {
      isPostOrChatInvalid = true
    }
  }

  useEffect(() => {
    if (chat?.appId && defaultPost?.id && chat.appId === defaultPost.id) {
      void navigation.replace(`/c/:chatId`, {
        chatId: chat.id,
      })
    }
  }, [chat?.appId, chat?.id, defaultPost?.id, navigation])

  return (
    <MainLayout appId={appId} chatId={chatId} variant={HeaderVariants.Chatbot}>
      {/* Apply a key to force full remounts; otherwise nested effects might not work... Nextjs related */}
      {!isPostOrChatInvalid && (
        <Chat appId={appId} chatId={chatId} key={navigation.asPath} />
      )}
      {isPostOrChatInvalid && <PostError />}
    </MainLayout>
  )
}
