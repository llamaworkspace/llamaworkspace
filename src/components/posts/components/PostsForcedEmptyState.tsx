import { ChatEmptyState } from '@/components/chats/components/ChatEmptyState'
import { MainLayout } from '@/components/layout/MainLayout'

export function PostsForcedEmptyState() {
  return (
    <MainLayout hideHeader={true}>
      <ChatEmptyState />
    </MainLayout>
  )
}
