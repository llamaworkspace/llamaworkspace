import { useLatestPost } from '@/components/posts/postsHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useCallback } from 'react'

/**
 * Hook that automatically redirects to the latest post in the current workspace.
 * If there are no posts, it returns hasNoPosts=true after it finishes loading.
 */
export function useDefaultPageRedirection() {
  const { workspace, isLoading: isLoadingWorkspace } = useCurrentWorkspace()
  const { data: post, isLoading: isLoadingPage } = useLatestPost(
    isLoadingWorkspace ? undefined : workspace?.id,
  )
  const navigation = useNavigation()

  const redirect = useCallback(() => {
    if (post) {
      if (!post.lastChatId) {
        void navigation.replace(`/p/:postId/c/new`, {
          postId: post.id,
        })
      } else {
        void navigation.replace(`/p/:postId/c/:chatId`, {
          postId: post.id,
          chatId: post.lastChatId,
        })
      }
    }
  }, [post, navigation])

  const isLoading = isLoadingWorkspace || isLoadingPage
  const hasNoPosts = isLoading ? undefined : !post

  return {
    redirect: post && !isLoading ? redirect : undefined,
    hasNoPosts,
    isLoading,
  }
}
