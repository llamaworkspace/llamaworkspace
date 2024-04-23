import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useCallback } from 'react'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useDefaultPost } from '../posts/postsHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'
import { getChatsGroupedByDate } from './utils/sidebarUtils'

export const useChatHistoryForSidebarPostV2 = () => {
  const errorHandler = useErrorHandler()
  const { data: workspace } = useCurrentWorkspace()
  return api.sidebar.chatHistoryForSidebarV2.useQuery(
    { workspaceId: workspace?.id! },
    {
      onError: errorHandler(),
      enabled: !!workspace?.id,
      select: (data) => {
        return getChatsGroupedByDate(data)
      },
    },
  )
}

export const useChatHistoryForSidebarPost = (postId?: string) => {
  const errorHandler = useErrorHandler()
  const { data: workspace } = useCurrentWorkspace()
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

export const usePostsForSidebarV2 = (workspaceId: string | undefined) => {
  const errorHandler = useErrorHandler()

  return api.sidebar.postsForSidebarV2.useQuery(
    {
      workspaceId: workspaceId!,
    },
    {
      onError: errorHandler(),
      enabled: !!workspaceId,
    },
  )
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
  const { data: workspace } = useCurrentWorkspace()
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

export const useSidebarButtonLikeStyles = (isSelected = false) => {
  return cn(
    'group flex w-full grow basis-0 cursor-pointer items-center justify-between gap-x-2 rounded px-2 text-zinc-950 transition hover:bg-zinc-200/80 active:bg-zinc-300 duration-75 delay-0',
    isSelected && 'bg-zinc-200',
  )
}
