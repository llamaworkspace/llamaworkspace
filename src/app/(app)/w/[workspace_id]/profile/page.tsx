'use client'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { Profile } from '@/components/users/components/Profile'

export default function WorkspaceProfilePage() {
  return (
    <MainLayout variant={HeaderVariants.Hidden}>
      <Profile />
    </MainLayout>
  )
}
