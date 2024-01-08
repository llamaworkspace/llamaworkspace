import { api } from '@/lib/api'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useEffect } from 'react'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useWorkspaceIdFromLocalStorage } from '../global/localStorageHooks'

const useFirstWorkspaceForUser = (enabled?: boolean) => {
  const errorHandler = useErrorHandler()

  return api.workspaces.getFirstWorkspaceForUser.useQuery(undefined, {
    onError: errorHandler(),
    enabled: enabled ?? true,
  })
}

const useWorkspace = (workspaceId?: string) => {
  const errorHandler = useErrorHandler()

  return api.workspaces.getWorkspace.useQuery(
    { workspaceId: workspaceId! },
    {
      onError: errorHandler(),
      enabled: !!workspaceId,
    },
  )
}

const useWorkspaceForPostId = (postId?: string) => {
  const errorHandler = useErrorHandler()

  return api.workspaces.getWorkspaceIdForPost.useQuery(
    { postId: postId! },
    {
      onError: errorHandler(),
      enabled: !!postId,
    },
  )
}

const useWorkspaceForChatId = (chatId?: string) => {
  const errorHandler = useErrorHandler()

  return api.workspaces.getWorkspaceIdForChat.useQuery(
    { chatId: chatId! },
    {
      onError: errorHandler(),
      enabled: !!chatId,
    },
  )
}

export const useCurrentWorkspace = () => {
  const [lsWorkspaceId, setLastWorkspaceId] = useWorkspaceIdFromLocalStorage()
  const navigation = useNavigation()
  const { workspace_id, post_id, chat_id } = navigation.query

  const workspaceId = lsWorkspaceId ?? (workspace_id as string | undefined)
  const chatId = chat_id as string | undefined
  const postId = post_id as string | undefined

  const workspaceFirstFromUser = useFirstWorkspaceForUser(!workspaceId)
  const workspaceFromWsId = useWorkspace(workspaceId)
  const workspaceFromChatId = useWorkspaceForChatId(
    workspaceId ? undefined : chatId,
  )
  const workspaceFromPostId = useWorkspaceForPostId(
    workspaceId ?? chatId ? undefined : postId,
  )

  const targetWorkspaceId =
    workspaceFirstFromUser.data?.id ??
    workspaceFromWsId.data?.id ??
    workspaceFromChatId.data?.id ??
    workspaceFromPostId.data?.id

  useEffect(() => {
    if (targetWorkspaceId) {
      console.log('Setting ws id', targetWorkspaceId)
      setLastWorkspaceId(targetWorkspaceId)
    }
  }, [targetWorkspaceId, setLastWorkspaceId])

  if (workspaceId) {
    return workspaceFromWsId
  } else if (chatId) {
    return workspaceFromChatId
  } else if (postId) {
    return workspaceFromPostId
  }
  return workspaceFirstFromUser
}

export const useWorkspaces = () => {
  const errorHandler = useErrorHandler()

  const { data: workspaces, isLoading } = api.workspaces.getWorkspaces.useQuery(
    undefined,
    {
      onError: errorHandler(),
    },
  )

  return { workspaces, isLoading }
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
