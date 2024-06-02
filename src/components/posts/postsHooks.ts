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

  return api.apps.getDefault.useQuery(
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
  const { mutate, isLoading, ...rest } = api.apps.create.useMutation({
    onError: errorHandler(),
    onSuccess: (app) => {
      // Important: Invalidate the entire sidebar cache!
      void utils.sidebar.invalidate()
      void navigation.push(
        `/p/:postId/configuration`,
        {
          postId: app.id,
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
  const { sidebar: sidebarRouter, apps: postsRouter } = api.useContext()

  const { appsForSidebar } = sidebarRouter
  const { getById: getPostById } = postsRouter
  const appsForSidebarRef = useRef(appsForSidebar)
  const getPostByIdRef = useRef(getPostById)
  const utils = api.useContext()

  const { mutate, ...rest } = api.apps.update.useMutation({
    onError: errorHandler(),
    onSuccess: async () => {
      await utils.sidebar.invalidate()
      await utils.apps.invalidate()
    },
  })
  const { data: workspace } = useCurrentWorkspace()

  const debounced = useMemo(() => {
    const _debounced = serialDebouncer((params: PostUpdateInput) => {
      mutate(params)
    }, debounceMs)

    return (params: PostUpdateInput) => {
      appsForSidebarRef.current.setData(
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
  }, [debounceMs, workspace, appsForSidebarRef, getPostByIdRef, mutate])

  return {
    mutate: debounced,
    ...rest,
  }
}

export const useDeletePost = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  return api.apps.delete.useMutation({
    onError: errorHandler(),
    onSuccess: async () => {
      // Important: Invalidate the entire sidebar cache!
      await utils.sidebar.invalidate()
      await utils.apps.invalidate()
    },
  })
}

export const usePostById = (postId?: string) => {
  const errorHandler = useErrorHandler()

  return api.apps.getById.useQuery(
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

  return api.apps.getList.useQuery(
    {
      workspaceId: workspaceId ?? '',
    },
    { onError: errorHandler(), enabled: !!workspaceId },
  )
}

export const usePostShare = (postId?: string) => {
  const errorHandler = useErrorHandler()

  return api.apps.getShare.useQuery(
    { postId: postId! },
    {
      onError: errorHandler(),
      enabled: !!postId,
    },
  )
}

export const useLatestAppConfigVersionForPost = (postId?: string) => {
  const errorHandler = useErrorHandler()

  return api.apps.getLatestConfig.useQuery(
    { postId: postId! },
    {
      onError: errorHandler(),
      enabled: !!postId,
    },
  )
}

export const useAppConfigUpdate = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  return api.apps.updateConfig.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.apps.getLatestConfig.invalidate()
    },
  })
}

export const usePostPerformInvite = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  return api.apps.share.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.apps.getShare.invalidate()
    },
    retry: false,
  })
}
export const usePostShareUpdate = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()
  return api.apps.updateShare.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.apps.getShare.invalidate()
    },
  })
}

export const useUpdateShareAccessLevelForPost = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()
  return api.apps.updateShareAccessLevel.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.apps.getShare.invalidate()
    },
  })
}

export const useAppFiles = (appId?: string) => {
  const errorHandler = useErrorHandler()

  return api.apps.getAppAssets.useQuery(
    { appId: appId! },
    {
      onError: errorHandler(),
      enabled: !!appId,
    },
  )
}
