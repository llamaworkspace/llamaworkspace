import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { AppConfig } from '@/components/posts/components/AppConfig/AppConfig'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function AppConfigPage() {
  const navigation = useNavigation()
  const query = navigation.query

  const appId = query.post_id as string | undefined
  return (
    <MainLayout appId={appId} variant={HeaderVariants.Chatbot}>
      <AppConfig appId={appId} />
    </MainLayout>
  )
}
