import { useAppById, useDefaultApp } from '@/components/apps/appsHooks'
import { AppError } from '@/components/apps/components/AppError'
import { useChatById } from '@/components/chats/chatHooks'
import { Chat } from '@/components/chats/components/Chat'
import { MainLayout } from '@/components/layout/MainLayout'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useEffect } from 'react'
import { HeaderVariants } from '../../../../../components/layout/MainLayout/MainLayoutHeader'

export default function ChatPage() {
  const navigation = useNavigation()
  const query = navigation.query
  const appId = query.app_id as string | undefined
  const chatId = query.chat_id as string | undefined
  const { data: app, isLoading: appIsLoading } = useAppById(appId)
  const { data: chat, isLoading: chatIsLoading } = useChatById(chatId)
  const { data: defaultApp, isLoading: defaultAppIsLoading } = useDefaultApp()

  let isAppOrChatInvalid = false
  if (!appIsLoading && !chatIsLoading) {
    if (!app || !chat) {
      isAppOrChatInvalid = true
    }
  }

  useEffect(() => {
    if (chat?.appId && defaultApp?.id && chat.appId === defaultApp.id) {
      void navigation.replace(`/c/:chatId`, {
        chatId: chat.id,
      })
    }
  }, [chat?.appId, chat?.id, defaultApp?.id, navigation])

  return (
    <MainLayout appId={appId} chatId={chatId} variant={HeaderVariants.Chatbot}>
      {/* Apply a key to force full remounts; otherwise nested effects might not work... Nextjs related */}
      {!isAppOrChatInvalid && (
        <Chat appId={appId} chatId={chatId} key={navigation.asPath} />
      )}
      {isAppOrChatInvalid && <AppError />}
    </MainLayout>
  )
}
