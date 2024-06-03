import { AppConfig } from '@/components/apps/components/AppConfig/AppConfig'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function AppConfigPage() {
  const navigation = useNavigation()
  const query = navigation.query

  const appId = query.app_id as string | undefined
  return (
    <MainLayout appId={appId} variant={HeaderVariants.Chatbot}>
      <AppConfig appId={appId} />
    </MainLayout>
  )
}
