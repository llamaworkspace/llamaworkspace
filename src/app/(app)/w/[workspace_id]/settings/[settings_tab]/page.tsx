'use client'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { Settings } from '@/components/workspaces/components/Settings/Settings'
import { useParams } from 'next/navigation'

export default function WorkspaceProfilePage() {
  const params = useParams<{ settings_tab: string }>()
  const settingsTab = params?.settings_tab

  if (!settingsTab) {
    throw new Error('settings_tab is required')
  }

  return (
    <MainLayout variant={HeaderVariants.Hidden}>
      <Settings tab={settingsTab} />
    </MainLayout>
  )
}
