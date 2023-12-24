import { api } from '@/lib/api'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'

export const useProviders = () => {
  const { workspace } = useCurrentWorkspace()
  const errorHandler = useErrorHandler()

  return api.providers.getProviders.useQuery(
    { workspaceId: workspace?.id! },
    {
      enabled: !!workspace?.id,
      onError: errorHandler(),
    },
  )
}

export const useUpdateProvider = () => {
  const errorHandler = useErrorHandler()
  return api.providers.updateProvider.useMutation({
    onError: errorHandler(),
  })
}
