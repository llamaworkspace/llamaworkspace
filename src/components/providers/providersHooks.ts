import { api } from '@/lib/api'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'

export const useProviders = () => {
  const { workspace } = useCurrentWorkspace()

  return api.providers.getProviders.useQuery(
    { workspaceId: workspace?.id! },
    {
      enabled: !!workspace?.id,
    },
  )
}
