import { api } from '@/lib/api'
import { type PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { useErrorHandler } from '../global/errorHandlingHooks'

export const useCanPerformActionForApp = (
  action: PermissionAction,
  appId?: string,
) => {
  const errorHandler = useErrorHandler()

  return api.permissions.canPerformActionForAppId.useQuery(
    { action, appId: appId! },
    {
      onError: errorHandler(),
      enabled: !!appId,
    },
  )
}
