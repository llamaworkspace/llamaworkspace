import { api } from '@/lib/api'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useEffect, useState } from 'react'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useLatestWorkspaceIdLocalStorage } from '../global/localStorageHooks'

const useWorkspaceFromPathWorkspace = () => {
  const errorHandler = useErrorHandler()
  const navigation = useNavigation()
  const { workspace_id } = navigation.query

  const enabled = !!workspace_id

  const { data: workspace, isLoading } = api.workspaces.getWorkspace.useQuery(
    { workspaceId: workspace_id as string },
    {
      onError: errorHandler(),
      enabled,
    },
  )

  return {
    workspace: enabled ? workspace : undefined,
    isLoading: isLoading && enabled,
  }
}

const useWorkspaceFromPathPost = () => {
  const errorHandler = useErrorHandler()
  const navigation = useNavigation()
  const { post_id } = navigation.query

  const { workspace: workspaceWithPriority, isLoading: isLoadingWithPriority } =
    useWorkspaceFromPathWorkspace()

  const enabled = !!post_id && !workspaceWithPriority && !isLoadingWithPriority

  const { data: fetchedWorkspace, isLoading } =
    api.workspaces.getWorkspaceIdForPost.useQuery(
      { postId: post_id as string },
      {
        onError: errorHandler(),
        enabled,
      },
    )

  const workspace = enabled ? fetchedWorkspace : undefined

  return {
    workspace: workspaceWithPriority ?? workspace,
    isLoading: isLoadingWithPriority || (isLoading && enabled),
  }
}

const useWorkspaceFromPathChat = () => {
  const errorHandler = useErrorHandler()
  const navigation = useNavigation()
  const { chat_id } = navigation.query

  const { workspace: workspaceWithPriority, isLoading: isLoadingWithPriority } =
    useWorkspaceFromPathPost()

  const enabled = !!chat_id && !workspaceWithPriority && !isLoadingWithPriority

  const { data: fetchedWorkspace, isLoading } =
    api.workspaces.getWorkspaceIdForChat.useQuery(
      { chatId: chat_id as string },
      {
        onError: errorHandler(),
        enabled,
      },
    )
  const workspace = enabled ? fetchedWorkspace : undefined
  return {
    workspace: workspaceWithPriority ?? workspace,
    isLoading: isLoadingWithPriority || (isLoading && enabled),
  }
}

const useLocalStorageWorkspace = () => {
  const errorHandler = useErrorHandler()
  const [lastWorkspaceId, setLastWorkspaceId] =
    useLatestWorkspaceIdLocalStorage()

  const { workspace: workspaceWithPriority, isLoading: isLoadingWithPriority } =
    useWorkspaceFromPathChat()

  const enabled = !workspaceWithPriority && !isLoadingWithPriority

  const {
    data: fetchedWorkspace,
    isLoading,
    isError,
  } = api.workspaces.getWorkspace.useQuery(
    { workspaceId: lastWorkspaceId },
    {
      onError: errorHandler(),
      enabled: enabled,
    },
  )
  const workspace = enabled ? fetchedWorkspace : undefined

  // If the workspace in local storage was removed or is corrupt,
  // try again by cleaning it to get the default instead
  const [retried, setRetried] = useState(false)
  useEffect(() => {
    if (!retried && isError) {
      setRetried(true)
      setLastWorkspaceId(undefined)
    }
  }, [retried, isError, setLastWorkspaceId])

  useEffect(() => {
    const currentWorkspace = workspaceWithPriority ?? workspace

    if (currentWorkspace) {
      // This will send an extra query when using the default workspace strategy.
      // However, it's not a big deal since it will just run once per client.
      setLastWorkspaceId(currentWorkspace.id)
    }
  }, [workspaceWithPriority, workspace, setLastWorkspaceId])

  return {
    workspace: workspaceWithPriority ?? fetchedWorkspace,
    isLoading: isLoadingWithPriority || (isLoading && enabled),
  }
}

export const useCurrentWorkspace = () => {
  // First strategy of the chain
  return useLocalStorageWorkspace()
}

export const useWorkspaces = () => {
  const errorHandler = useErrorHandler()

  return api.workspaces.getWorkspaces.useQuery(undefined, {
    onError: errorHandler(),
  })
}

export const useCreateWorkspace = () => {
  const errorHandler = useErrorHandler()

  return api.workspaces.createWorkspace.useMutation({
    onError: errorHandler(),
  })
}

export const useUpdateWorkspace = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  return api.workspaces.updateWorkspace.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      // Invalidate all as there are multiple queries that depend on workspaces
      void utils.workspaces.invalidate()
    },
  })
}
