import { useAppById, useDefaultApp } from '@/components/apps/appsHooks'
import { AppError } from '@/components/apps/components/AppError'
import { useChatById } from '@/components/chats/chatHooks'
import { Chat } from '@/components/chats/components/Chat'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ChatPage() {
  const params = useParams<{ app_id: string; chat_id: string }>()
  const pathname = usePathname()
  const router = useRouter()

  const appId = params?.app_id
  const chatId = params?.chat_id
  const { data: app, isLoading: appIsLoading } = useAppById(appId)
  const { data: chat, isLoading: chatIsLoading } = useChatById(chatId)
  const { data: defaultApp } = useDefaultApp()

  let isAppOrChatInvalid = false
  if (!appIsLoading && !chatIsLoading) {
    if (!app || !chat) {
      isAppOrChatInvalid = true
    }
  }

  useEffect(() => {
    if (chat?.appId && defaultApp?.id && chat.appId === defaultApp.id) {
      router.replace(`/c/${chat.id}`)
    }
  }, [chat?.appId, chat?.id, defaultApp?.id, router])

  return (
    <MainLayout appId={appId} chatId={chatId} variant={HeaderVariants.Chatbot}>
      {/* Apply a key to force full remounts; otherwise nested effects might not work... Nextjs related */}
      {!isAppOrChatInvalid && (
        <Chat appId={appId} chatId={chatId} key={pathname} />
      )}
      {isAppOrChatInvalid && <AppError />}
    </MainLayout>
  )
}
