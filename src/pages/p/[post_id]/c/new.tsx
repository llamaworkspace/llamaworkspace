import { Chat } from '@/components/chats/Chat'
import { useCreateSharedChat } from '@/components/chats/chatHooks'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { useNavigation } from '@/lib/frontend/useNavigation'

import { useEffect, useRef } from 'react'

export default function NewChatPage() {
  const navigation = useNavigation()

  const isChatCreateInvokedRef = useRef(false)
  const query = navigation.query

  const postId = query.post_id as string | undefined
  const { mutate: createChat } = useCreateSharedChat()

  useEffect(() => {
    // Make this hook idempotent
    if (isChatCreateInvokedRef.current === true) return

    if (postId) {
      isChatCreateInvokedRef.current = true
      createChat({ postId })
    }
  }, [createChat, postId])

  return (
    <MainLayout postId={postId} variant={HeaderVariants.Chatbot}>
      <Chat postId={postId} chatId={undefined} />
    </MainLayout>
  )
}
