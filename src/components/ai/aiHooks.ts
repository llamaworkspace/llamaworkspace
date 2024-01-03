import { api } from '@/lib/api'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'

export const useAiProvidersWithDBFields = () => {
  const { workspace } = useCurrentWorkspace()
  const errorHandler = useErrorHandler()

  return api.ai.getAiProvidersWithDBEntries.useQuery(
    { workspaceId: workspace?.id! },
    {
      enabled: !!workspace?.id,
      onError: errorHandler(),
    },
  )
}

export const useUpdateAiProvider = () => {
  const errorHandler = useErrorHandler()
  return api.ai.updateAiProvider.useMutation({
    onError: errorHandler(),
  })
}

export const useAiModelsMetaForProvider = (providerSlug?: string) => {
  const { workspace } = useCurrentWorkspace()
  const errorHandler = useErrorHandler()

  return api.ai.getAiModelsMetaForProvider.useQuery(
    { providerSlug: providerSlug!, workspaceId: workspace?.id! },
    {
      enabled: !!providerSlug && !!workspace?.id,
      onError: errorHandler(),
    },
  )
}

export const useEnabledAiModels = () => {
  const { workspace } = useCurrentWorkspace()
  const errorHandler = useErrorHandler()

  return api.ai.getWIPEnabledAiModels.useQuery(
    { workspaceId: workspace?.id! },
    {
      enabled: !!workspace?.id,
      onError: errorHandler(),
    },
  )
}
