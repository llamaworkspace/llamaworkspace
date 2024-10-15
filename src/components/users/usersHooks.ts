import { api } from '@/lib/api'
import { UserRole } from '@/shared/globalTypes'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'

export const useSelf = () => {
  const errorHandler = useErrorHandler()

  return api.users.getSelf.useQuery(undefined, {
    onError: errorHandler(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}

export const useUpdateSelf = () => {
  const errorHandler = useErrorHandler()

  return api.users.updateSelf.useMutation({
    onError: errorHandler(),
  })
}

export const useGetUserOnWorkspace = () => {
  const { data: workspace } = useCurrentWorkspace()
  const errorHandler = useErrorHandler()
  return api.users.getUserOnWorkspace.useQuery(
    { workspaceId: workspace?.id! },
    {
      onError: errorHandler(),
      enabled: !!workspace?.id,
    },
  )
}

export const useIsAdmin = () => {
  const { data: userOnWorkspace, isLoading } = useGetUserOnWorkspace()
  return {
    isAdmin: userOnWorkspace?.role === UserRole.Admin,
    isLoading,
  }
}
