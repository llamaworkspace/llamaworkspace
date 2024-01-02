import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { Settings } from '@/components/workspaces/components/Settings'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function SettingsPage() {
  const navigation = useNavigation()
  const query = navigation.query

  const tab = query.settings_tab as string

  return (
    <MainLayout variant={HeaderVariants.Hidden}>
      <Settings tab={tab} />
    </MainLayout>
  )
}
