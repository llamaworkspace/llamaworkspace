import { useCreateChatForApp } from '@/components/chats/chatHooks'
import { Chat } from '@/components/chats/components/Chat'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { useNavigation } from '@/lib/frontend/useNavigation'

import { useEffect, useRef } from 'react'

export default function NewChatPage() {
  const navigation = useNavigation()

  const isChatCreateInvokedRef = useRef(false)
  const query = navigation.query

  const appId = query.app_id as string | undefined
  const { mutate: createChat } = useCreateChatForApp()

  useEffect(() => {
    // Make this hook idempotent
    if (isChatCreateInvokedRef.current === true) return

    if (appId) {
      isChatCreateInvokedRef.current = true
      createChat({ appId })
    }
  }, [createChat, appId])

  return (
    <MainLayout appId={appId} variant={HeaderVariants.Chatbot}>
      <Chat appId={appId} chatId={undefined} />
    </MainLayout>
  )
}
