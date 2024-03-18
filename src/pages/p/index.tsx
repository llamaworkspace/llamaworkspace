import { MainLayout } from '@/components/layout/MainLayout'
import { HeaderVariants } from '@/components/layout/MainLayout/MainLayoutHeader'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

// Zero chatRuns?
// One chatbot? => Chatbot

// Else, redirect to /c/new?workspaceId=workspace.id

// Me he quedado aqui, hay que dirigir a shared chatbots o single chat condicionalmente.
// Idealmente se resuelve con next-auth y SSE, xo faltará el workspaceId

export default function AppIndexPage() {
  const { replace } = useRouter()
  const { workspace } = useCurrentWorkspace()

  useEffect(() => {
    async function doRedirect() {
      if (!workspace) return
      const url = `/c/new?workspaceId=${workspace.id}`
      await replace(url)
    }
    // void doRedirect()
  }, [workspace, replace])

  return <MainLayout variant={HeaderVariants.Hidden} />
}
