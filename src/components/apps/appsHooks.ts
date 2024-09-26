import { api } from '@/lib/api'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { serialDebouncer } from '@/lib/utils'
import { produce } from 'immer'
import { useMemo, useRef } from 'react'
import { throttle } from 'underscore'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'
import type { AppUpdateInput } from './appsTypes'

export const useDefaultApp = () => {
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

export const useIsDefaultApp = (appId?: string) => {
  const { data: defaultApp } = useDefaultApp()

  if (!defaultApp || !appId) return

  return defaultApp.id === appId
}

export const useCreateApp = () => {
  const errorHandler = useErrorHandler()
  const navigation = useNavigation()
  const utils = api.useContext()
  const { mutate, isLoading, ...rest } = api.apps.create.useMutation({
    onError: errorHandler(),
    onSuccess: (app) => {
      // Important: Invalidate the entire sidebar cache!
      void utils.sidebar.invalidate()
      void navigation.push(
        `/p/:appId/configuration`,
        {
          appId: app.id,
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

export const useUpdateApp = (debounceMs = 0) => {
  const errorHandler = useErrorHandler()
  const { sidebar: sidebarRouter, apps: appsRouter } = api.useContext()

  const { appsForSidebar } = sidebarRouter
  const { getById: getAppById } = appsRouter
  const appsForSidebarRef = useRef(appsForSidebar)
  const getAppByIdRef = useRef(getAppById)
  const utils = api.useContext()

  const { mutate, ...rest } = api.apps.update.useMutation({
    onError: errorHandler(),
    onSuccess: async () => {
      await utils.sidebar.invalidate()
      await utils.apps.invalidate()
    },
  })
  const { data: workspace } = useCurrentWorkspace()

  type MutateOptions = Parameters<typeof mutate>[1]

  const debounced = useMemo(() => {
    const _debounced = serialDebouncer(
      (params: AppUpdateInput, options: MutateOptions) => {
        mutate(params, options)
      },
      debounceMs,
    )

    return (params: AppUpdateInput, options: MutateOptions) => {
      appsForSidebarRef.current.setData(
        { workspaceId: workspace?.id! },
        (previous) => {
          if (!previous) return previous
          return produce(previous, (draft) => {
            const index = previous.findIndex((item) => item.id === params.id)
            const draftApp = draft[index]

            // Done manually to avoid weird code with type errors.
            if (draftApp) {
              if (params.title) {
                draftApp.title = params.title
              }

              if (params.emoji) {
                draftApp.emoji = params.emoji
              }
            }
          })
        },
      )

      getAppByIdRef.current.setData({ id: params.id }, (previous) => {
        if (!previous) return previous

        // Done manually to avoid werid code with type errors.
        return produce(previous, (draftApp) => {
          if (params.emoji) {
            draftApp.emoji = params.emoji
          }
          if (params.title) {
            draftApp.title = params.title
          }
        })
      })

      _debounced(params, options)
    }
  }, [debounceMs, workspace, appsForSidebarRef, getAppByIdRef, mutate])

  return {
    mutate: debounced,
    ...rest,
  }
}

export const useDeleteApp = () => {
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

export const useDuplicateApp = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  return api.apps.duplicate.useMutation({
    onError: errorHandler(),
    onSuccess: async () => {
      await utils.apps.invalidate()
      await utils.sidebar.invalidate()
    },
  })
}

export const useAppById = (appId?: string) => {
  const errorHandler = useErrorHandler()

  return api.apps.getById.useQuery(
    {
      id: appId!,
    },
    { onError: errorHandler(), enabled: !!appId },
  )
}

export const useAppsForAppsList = () => {
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

export const useAppShare = (appId?: string) => {
  const errorHandler = useErrorHandler()

  return api.apps.getShare.useQuery(
    { appId: appId! },
    {
      onError: errorHandler(),
      enabled: !!appId,
    },
  )
}

export const useLatestAppConfigVersionForApp = (appId?: string) => {
  const errorHandler = useErrorHandler()

  return api.apps.getLatestConfig.useQuery(
    { appId: appId! },
    {
      onError: errorHandler(),
      enabled: !!appId,
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

export const useAppPerformInvite = () => {
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
export const useAppShareUpdate = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()
  return api.apps.updateShare.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.apps.getShare.invalidate()
    },
  })
}

export const useUpdateShareAccessLevelForApp = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()
  return api.apps.updateShareAccessLevel.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.apps.getShare.invalidate()
    },
  })
}

type UseAppAssetsOptions = Parameters<typeof api.apps.getAppAssets.useQuery>[1]

export const useAppAssets = (
  appId?: string,
  options?: { refetchInterval?: number },
) => {
  const errorHandler = useErrorHandler()

  return api.apps.getAppAssets.useQuery(
    { appId: appId! },
    {
      onError: errorHandler(),
      enabled: !!appId,
      ...options,
    },
  )
}

export const useKeyValues = (appId?: string) => {
  const errorHandler = useErrorHandler()

  return api.apps.getKeyValues.useQuery(
    { id: appId! },
    {
      onError: errorHandler(),
      enabled: !!appId,
    },
  )
}

export const useUpdateKeyValues = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()
  return api.apps.updateKeyValues.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.apps.getShare.invalidate()
    },
  })
}
