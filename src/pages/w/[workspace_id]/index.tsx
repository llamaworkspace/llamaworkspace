import { ChatEmptyState } from '@/components/chats/components/ChatEmptyState'
import { useDefaultPageRedirection } from '@/components/global/redirectionHooks'
import { MainLayout } from '@/components/layout/MainLayout'
import { useEffect } from 'react'
import { isBoolean } from 'underscore'

export default function WorkspacesIndex() {
  const { redirect, hasNoPosts } = useDefaultPageRedirection()

  useEffect(() => {
    redirect?.()
  }, [redirect])

  return (
    <MainLayout hideHeader={hasNoPosts}>
      {isBoolean(hasNoPosts) && hasNoPosts && <ChatEmptyState />}
    </MainLayout>
  )
}
