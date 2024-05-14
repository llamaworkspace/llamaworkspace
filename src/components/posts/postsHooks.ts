import { api } from '@/lib/api'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { serialDebouncer } from '@/lib/utils'
import { produce } from 'immer'
import { useMemo, useRef } from 'react'
import { throttle } from 'underscore'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'
import type { PostUpdateInput } from './postsTypes'

export const useDefaultPost = () => {
  const errorHandler = useErrorHandler()
  const { data: workspace } = useCurrentWorkspace()

  return api.posts.getDefault.useQuery(
    { workspaceId: workspace?.id! },
    {
      enabled: !!workspace?.id,
      onError: errorHandler(),
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  )
}

export const useIsDefaultPost = (postId?: string) => {
  const { data: defaultPost } = useDefaultPost()

  if (!defaultPost || !postId) return

  return defaultPost.id === postId
}

export const useCreatePost = () => {
  const errorHandler = useErrorHandler()
  const navigation = useNavigation()
  const utils = api.useContext()
  const { mutate, isLoading, ...rest } = api.posts.create.useMutation({
    onError: errorHandler(),
    onSuccess: (post) => {
      // Important: Invalidate the entire sidebar cache!
      void utils.sidebar.invalidate()
      void navigation.push(
        `/p/:postId/configuration`,
        {
          postId: post.id,
        },
        {
          backButton: false,
          focus: 'title',
        },
      )
    },
  })

  type MutateArgs = Parameters<typeof mutate>
  type Params = MutateArgs[0]
  type Options = MutateArgs[1]

  const throttledMutate = throttle((params: Params, options?: Options) => {
    if (isLoading) return
    return mutate(params, options)
  }, 2000)

  return {
    mutate: throttledMutate,
    isLoading,
    ...rest,
  }
}

export const useUpdatePost = (debounceMs = 0) => {
  const errorHandler = useErrorHandler()
  const { sidebar: sidebarRouter, posts: postsRouter } = api.useContext()

  const { postsForSidebar } = sidebarRouter
  const { getById: getPostById } = postsRouter
  const postsForSidebarRef = useRef(postsForSidebar)
  const getPostByIdRef = useRef(getPostById)
  const utils = api.useContext()

  const { mutate, ...rest } = api.posts.update.useMutation({
    onError: errorHandler(),
    onSuccess: async () => {
      await utils.sidebar.invalidate()
      await utils.posts.invalidate()
    },
  })
  const { data: workspace } = useCurrentWorkspace()

  const debounced = useMemo(() => {
    const _debounced = serialDebouncer((params: PostUpdateInput) => {
      mutate(params)
    }, debounceMs)

    return (params: PostUpdateInput) => {
      postsForSidebarRef.current.setData(
        { workspaceId: workspace?.id! },
        (previous) => {
          if (!previous) return previous
          return produce(previous, (draft) => {
            const index = previous.findIndex((item) => item.id === params.id)
            const draftPost = draft[index]

            // Done manually to avoid weird code with type errors.
            if (draftPost) {
              if (params.title) {
                draftPost.title = params.title
              }

              if (params.emoji) {
                draftPost.emoji = params.emoji
              }
            }
          })
        },
      )

      getPostByIdRef.current.setData({ id: params.id }, (previous) => {
        if (!previous) return previous

        // Done manually to avoid werid code with type errors.
        return produce(previous, (draftPost) => {
          if (params.emoji) {
            draftPost.emoji = params.emoji
          }
          if (params.title) {
            draftPost.title = params.title
          }
        })
      })

      _debounced(params)
    }
  }, [debounceMs, workspace, postsForSidebarRef, getPostByIdRef, mutate])

  return {
    mutate: debounced,
    ...rest,
  }
}

export const useDeletePost = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  return api.posts.delete.useMutation({
    onError: errorHandler(),
    onSuccess: async () => {
      // Important: Invalidate the entire sidebar cache!
      await utils.sidebar.invalidate()
      await utils.posts.invalidate()
    },
  })
}

export const usePostById = (postId?: string) => {
  const errorHandler = useErrorHandler()

  return api.posts.getById.useQuery(
    {
      id: postId!,
    },
    { onError: errorHandler(), enabled: !!postId },
  )
}

export const usePostsForAppsList = () => {
  const errorHandler = useErrorHandler()
  const { data: workspace } = useCurrentWorkspace()
  const workspaceId = workspace?.id

  return api.posts.getList.useQuery(
    {
      workspaceId: workspaceId ?? '',
    },
    { onError: errorHandler(), enabled: !!workspaceId },
  )
}

export const usePostShare = (postId?: string) => {
  const errorHandler = useErrorHandler()

  return api.posts.getShare.useQuery(
    { postId: postId! },
    {
      onError: errorHandler(),
      enabled: !!postId,
    },
  )
}

export const useLatestPostConfigVersionForPost = (postId?: string) => {
  const errorHandler = useErrorHandler()

  return api.posts.getLatestConfig.useQuery(
    { postId: postId! },
    {
      onError: errorHandler(),
      enabled: !!postId,
    },
  )
}

export const usePostConfigUpdate = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  return api.posts.updateConfig.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.posts.getLatestConfig.invalidate()
    },
  })
}

export const usePostSharePerform = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  return api.posts.share.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.posts.getShare.invalidate()
    },
    retry: false,
  })
}
export const usePostShareUpdate = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()
  return api.posts.updateShare.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.posts.getShare.invalidate()
    },
  })
}

export const useUpdateShareAccessLevelForPost = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()
  return api.posts.updateShareAccessLevel.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.posts.getShare.invalidate()
    },
  })
}
