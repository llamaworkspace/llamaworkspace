import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { Settings } from '@/components/workspaces/components/Settings/Settings'
import { useParams } from 'next/navigation'

export default function SettingsPage() {
  const params = useParams<{ settings_tab: string }>()

  const tab = params?.settings_tab!

  return (
    <MainLayout variant={HeaderVariants.Hidden}>
      <Settings tab={tab} />
    </MainLayout>
  )
}
