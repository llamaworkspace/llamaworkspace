import { useAppById } from '@/components/apps/appsHooks'
import { AppError } from '@/components/apps/components/AppError'
import { useChatById } from '@/components/chats/chatHooks'
import { Chat } from '@/components/chats/components/Chat'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { useParams, usePathname } from 'next/navigation'

export default function ChatPage() {
  const params = useParams<{ chat_id: string }>()
  const pathname = usePathname()

  const chatId = params?.chat_id
  const { data: chat, isLoading: chatIsLoading } = useChatById(chatId)
  const { data: app, isLoading: appIsLoading } = useAppById(chat?.appId)

  const isLoadingCompleted = !!(chat && app)
  const isDefaultApp = isLoadingCompleted && app.isDefault

  let isAppOrChatInvalid = false
  if (!appIsLoading && !chatIsLoading) {
    if (!app || !chat) {
      isAppOrChatInvalid = true
    }
  }

  let variant: HeaderVariants = HeaderVariants.Hidden
  if (isLoadingCompleted) {
    variant = isDefaultApp ? HeaderVariants.Chat : HeaderVariants.Chatbot
  }

  return (
    <MainLayout appId={app?.id} chatId={chatId} variant={variant}>
      {/* Apply a key to force full remounts; otherwise nested effects might not work... Nextjs related */}
      {!isAppOrChatInvalid && (
        <Chat appId={app?.id} chatId={chatId} key={pathname} />
      )}
      {isAppOrChatInvalid && <AppError />}
    </MainLayout>
  )
}
