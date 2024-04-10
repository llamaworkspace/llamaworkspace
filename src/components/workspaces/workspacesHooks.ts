import { api } from '@/lib/api'
import { useMemo } from 'react'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useSelf } from '../users/usersHooks'

export const useCurrentWorkspace = () => {
  const { data, isLoading } = useSelf()

  return useMemo(() => {
    return { data: data?.workspace, isLoading }
  }, [data, isLoading])
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
