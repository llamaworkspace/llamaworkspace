import { ChatEmptyState } from '@/components/chats/components/ChatEmptyState'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'

export function AppsForcedEmptyState() {
  return (
    <MainLayout variant={HeaderVariants.Hidden}>
      <ChatEmptyState />
    </MainLayout>
  )
}
