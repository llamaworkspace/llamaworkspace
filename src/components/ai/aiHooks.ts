import { api } from '@/lib/api'
import { useMemo } from 'react'
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

export interface UseAiModelsOptions {
  isSetupOk?: boolean
  fullSlugs?: string[]
}

export const useAiModels = (options?: UseAiModelsOptions) => {
  const { workspace } = useCurrentWorkspace()
  const errorHandler = useErrorHandler()

  const queryResponse = api.ai.getAiProviders.useQuery(
    { workspaceId: workspace?.id! },
    {
      enabled: !!workspace?.id,
      onError: errorHandler(),
    },
  )
  const data = useMemo(() => {
    return queryResponse.data?.flatMap((provider) => {
      let models = provider.models
      if (options?.isSetupOk) {
        models = models.filter((model) => model.isSetupOk)
      }
      if (options?.fullSlugs?.length) {
        models = models.filter(
          (model) =>
            model.fullSlug && options.fullSlugs!.includes(model.fullSlug),
        )
      }
      return models
    })
  }, [queryResponse.data, options?.isSetupOk, options?.fullSlugs])

  return {
    ...queryResponse,
    data,
  }
}
