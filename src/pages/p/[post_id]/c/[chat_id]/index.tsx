import { Chat } from '@/components/chats/Chat'
import { useChatById } from '@/components/chats/chatHooks'
import { MainLayout } from '@/components/layout/MainLayout'
import { PostError } from '@/components/posts/components/PostError'
import { useDefaultPost, usePostById } from '@/components/posts/postsHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useEffect } from 'react'
import { HeaderVariants } from '../../../../../components/layout/MainLayout/MainLayoutHeader'

export default function ChatPage() {
  const navigation = useNavigation()
  const query = navigation.query
  const postId = query.post_id as string | undefined
  const chatId = query.chat_id as string | undefined
  const { data: post, isLoading: postIsLoading } = usePostById(postId)
  const { data: chat, isLoading: chatIsLoading } = useChatById(chatId)
  const { data: defaultPost, isLoading: defaultPostIsLoading } =
    useDefaultPost()

  let isPostOrChatInvalid = false
  if (!postIsLoading && !chatIsLoading) {
    if (!post || !chat) {
      isPostOrChatInvalid = true
    }
  }

  useEffect(() => {
    if (chat?.postId && defaultPost?.id && chat.postId === defaultPost.id) {
      void navigation.replace(`/c/:chatId`, {
        chatId: chat.id,
      })
    }
  }, [chat?.postId, chat?.id, defaultPost?.id, navigation])

  return (
    <MainLayout postId={postId} variant={HeaderVariants.Chatbot}>
      {!isPostOrChatInvalid && <Chat postId={postId} chatId={chatId} />}
      {isPostOrChatInvalid && <PostError />}
    </MainLayout>
  )
}
