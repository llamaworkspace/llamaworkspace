import { AppConfig } from '@/components/apps/components/AppConfig/AppConfig'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { useParams } from 'next/navigation'

export default function AppConfigPage() {
  const params = useParams<{ app_id: string; chat_id: string }>()

  const appId = params?.app_id
  const chatId = params?.chat_id

  return (
    <MainLayout appId={appId} chatId={chatId} variant={HeaderVariants.Chatbot}>
      <AppConfig appId={appId} />
    </MainLayout>
  )
}
