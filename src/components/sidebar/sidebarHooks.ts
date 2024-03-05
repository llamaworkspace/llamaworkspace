import { api } from '@/lib/api'
import { useCallback } from 'react'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useDefaultPost } from '../posts/postsHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'

export const useChatHistoryForSidebarPost = (postId?: string) => {
  const errorHandler = useErrorHandler()
  const { workspace } = useCurrentWorkspace()
  return api.sidebar.chatHistoryForSidebar.useQuery(
    { postId: postId!, workspaceId: workspace?.id! },
    {
      onError: errorHandler(),
      enabled: !!postId && !!workspace?.id,
    },
  )
}

export const usePostsForSidebar = (workspaceId: string | undefined) => {
  const errorHandler = useErrorHandler()

  const postsForSidebarQuery = api.sidebar.postsForSidebar.useQuery(
    {
      workspaceId: workspaceId!,
    },
    {
      onError: errorHandler(),
      enabled: !!workspaceId,
    },
  )

  return {
    sortedPosts: postsForSidebarQuery.data,
  }
}

export const useUpdatePostSorting = (workspaceId: string | undefined) => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  const { sortedPosts } = usePostsForSidebar(workspaceId)

  const { mutate } = api.sidebar.updatePostSortingForSidebar.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.sidebar.postsForSidebar.invalidate()
    },
  })

  const movePostBefore = useCallback(
    (postId: string, pivotPostId: string) => {
      if (sortedPosts) {
        const newSortedPostIds = sortedPosts
          .filter((post) => post.id !== postId)
          .map((post) => post.id)
        const pivotPostIndex = newSortedPostIds.findIndex(
          (currentPostId) => currentPostId === pivotPostId,
        )

        newSortedPostIds.splice(pivotPostIndex, 0, postId)

        mutate({
          workspaceId: workspaceId!,
          sortedPosts: newSortedPostIds,
        })
      }
    },
    [sortedPosts, workspaceId, mutate],
  )

  const movePostAfter = useCallback(
    (postId: string, pivotPostId: string) => {
      if (sortedPosts) {
        const newSortedPostIds = sortedPosts
          .map((post) => post.id)
          .filter((currentPostId) => currentPostId !== postId)
        const pivotPostIndex = newSortedPostIds.findIndex(
          (currentPostId) => currentPostId === pivotPostId,
        )

        newSortedPostIds.splice(pivotPostIndex + 1, 0, postId)

        mutate({
          workspaceId: workspaceId!,
          sortedPosts: newSortedPostIds,
        })
      }
    },
    [sortedPosts, workspaceId, mutate],
  )

  return { movePostBefore, movePostAfter }
}

export const useInfoCardForSidebar = () => {
  const errorHandler = useErrorHandler()
  const { workspace } = useCurrentWorkspace()
  return api.sidebar.infoCardForSidebar.useQuery(
    { workspaceId: workspace?.id! },
    {
      onError: errorHandler(),
      enabled: !!workspace?.id,
    },
  )
}

export const useStandaloneChats = () => {
  const { data: post } = useDefaultPost()
  return useChatHistoryForSidebarPost(post?.id)
}
