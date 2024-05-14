import { useDefaultPost, useLatestPost } from '@/components/posts/postsHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useCallback, useEffect, useState } from 'react'
import {
  useCreateChatForApp,
  useCreateStandaloneChat,
} from '../chats/chatHooks'

/**
 * Hook that automatically redirects to the latest post in the current workspace.
 * If there are no posts, it returns hasNoPosts=true after it finishes loading.
 */
export function useDefaultPageRedirection() {
  const { data: workspace, isLoading: isLoadingWorkspace } =
    useCurrentWorkspace()
  const { data: post, isLoading: isLoadingPage } = useLatestPost(
    isLoadingWorkspace ? undefined : workspace?.id,
  )
  const navigation = useNavigation()
  const { mutate: createStandaloneChat } = useCreateStandaloneChat()
  const { mutate: createChatForApp } = useCreateChatForApp()
  const { data: defaultPost } = useDefaultPost()

  const postId = navigation.query?.post_id as string
  const workspaceId = navigation.query?.workspace_id as string

  const [redirectIsCalled, setRedirectIsCalled] = useState(false)
  const [isExecuted, setIsExecuted] = useState(false)

  const redirect = useCallback(() => {
    setRedirectIsCalled(true)
  }, [])

  useEffect(() => {
    if (!redirectIsCalled) return
    if (isExecuted) return

    if (postId) {
      if (!defaultPost) return
      if (postId === defaultPost.id) {
        setIsExecuted(true)
        void createStandaloneChat()
      } else {
        void createChatForApp({ postId })
      }

      return
    }

    if (workspaceId) {
      void navigation.replace(`/w/:workspaceId/settings`, { workspaceId })
    }
  }, [
    redirectIsCalled,
    isExecuted,
    postId,
    defaultPost,
    createStandaloneChat,
    createChatForApp,
    navigation,
    workspaceId,
  ])

  const isLoading = isLoadingWorkspace || isLoadingPage
  const hasNoPosts = isLoading ? undefined : !post

  return {
    redirect: post && !isLoading ? redirect : undefined,
    hasNoPosts,
    isLoading,
  }
}
