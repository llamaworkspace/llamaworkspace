import { ChatEmptyState } from '@/components/chats/components/ChatEmptyState'
import { useDefaultPageRedirection } from '@/components/global/redirectionHooks'
import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { useEffect } from 'react'
import { isBoolean } from 'underscore'

export default function WorkspacesIndex() {
  const { redirect, hasNoPosts } = useDefaultPageRedirection()

  useEffect(() => {
    redirect?.()
  }, [redirect])

  return (
    <MainLayout variant={HeaderVariants.Hidden}>
      {isBoolean(hasNoPosts) && hasNoPosts && <ChatEmptyState />}
    </MainLayout>
  )
}
