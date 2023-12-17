import { MainLayout } from '@/components/layout/MainLayout'
import { ChatEmptyState } from '@/components/chats/components/ChatEmptyState'

export function PostsForcedEmptyState() {
  return (
    <MainLayout hideHeader={true}>
      <ChatEmptyState />
    </MainLayout>
  )
}
