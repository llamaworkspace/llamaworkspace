import { api } from '@/lib/api'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'

export const useAiProviders = () => {
  const { workspace } = useCurrentWorkspace()
  const errorHandler = useErrorHandler()

  return api.ai.getAiProviders.useQuery(
    { workspaceId: workspace?.id! },
    {
      enabled: !!workspace?.id,
      onError: errorHandler(),
    },
  )
}

export const useUpdateAiProvider = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()
  return api.ai.updateAiProvider.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.ai.getAiProviders.invalidate()
    },
  })
}

export const useEnabledAiModels = () => {
  const { workspace } = useCurrentWorkspace()
  const errorHandler = useErrorHandler()

  return api.ai.getEnabledAiModels.useQuery(
    { workspaceId: workspace?.id! },
    {
      enabled: !!workspace?.id,
      onError: errorHandler(),
    },
  )
}
