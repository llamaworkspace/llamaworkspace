import { api } from 'lib/api'
import { type PermissionAction } from 'shared/permissions/permissionDefinitions'
import { useErrorHandler } from '../global/errorHandlingHooks'

export const useCanPerformActionForPost = (
  action: PermissionAction,
  postId?: string,
) => {
  const errorHandler = useErrorHandler()

  return api.permissions.canPerformActionForPostId.useQuery(
    { action, postId: postId! },
    {
      onError: errorHandler(),
      enabled: !!postId,
    },
  )
}
