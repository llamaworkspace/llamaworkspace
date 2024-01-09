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
  const [localStorageWorkspaceId, setLocalStorageWorkspaceId] =
    useWorkspaceIdFromLocalStorage()
  const navigation = useNavigation()
  const { workspace_id, post_id, chat_id } = navigation.query

  const workspaceId =
    localStorageWorkspaceId ?? (workspace_id as string | undefined)

  const workspaceIdFromUrl = workspace_id as string | undefined
  const chatIdFromUrl = chat_id as string | undefined
  const postIdFromUrl = post_id as string | undefined
  const loadWorkspaceFromFirstUser =
    !workspaceIdFromUrl && !chatIdFromUrl && !postIdFromUrl

  const workspaceFirstFromUser = useFirstWorkspaceForUser(
    loadWorkspaceFromFirstUser,
  )
  const workspaceFromWsId = useWorkspace(workspaceIdFromUrl)
  const workspaceFromChatId = useWorkspaceForChatId(chatIdFromUrl)
  const workspaceFromPostId = useWorkspaceForPostId(
    chatIdFromUrl ? undefined : postIdFromUrl,
  )

  // Order matters here
  const targetWorkspaceId =
    workspaceFromPostId.data?.id ??
    workspaceFromChatId.data?.id ??
    workspaceFromWsId.data?.id ??
    workspaceFirstFromUser.data?.id

  useEffect(() => {
    if (targetWorkspaceId) {
      setLocalStorageWorkspaceId(targetWorkspaceId)
    }
  }, [targetWorkspaceId, setLocalStorageWorkspaceId])

  if (workspaceFromPostId.data?.id) {
    return workspaceFromPostId
  } else if (workspaceFromChatId.data?.id) {
    return workspaceFromChatId
  } else if (workspaceFromWsId.data?.id) {
    return workspaceFromWsId
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
