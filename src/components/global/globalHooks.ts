import { api } from '@/lib/api'
import { useErrorHandler } from '../global/errorHandlingHooks'

export const useAddOpenAiApiKeyForOnboarding = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  return api.workspaces.updateWorkspaceForOnboarding.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      // Invalidate all as there are multiple queries that depend on workspaces
      void utils.workspaces.invalidate()
    },
  })
}
