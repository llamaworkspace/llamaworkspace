'use client'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { AppsList } from '@/components/workspaces/components/Apps/AppsList'

export default function WorkspaceProfilePage() {
  return (
    <MainLayout variant={HeaderVariants.Hidden}>
      <AppsList />
    </MainLayout>
  )
}
