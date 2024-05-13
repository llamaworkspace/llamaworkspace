import { api } from '@/lib/api'
import { type PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { usePostShare } from '../posts/postsHooks'
import { useSelf } from '../users/usersHooks'
import { useWorkspaceMembers } from '../workspaces/workspaceMembersHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'

export const useAccessLevelForPost = (postId?: string) => {
  const { data: user } = useSelf()
  const { data: workspace } = useCurrentWorkspace()
  const { workspaceMembers } = useWorkspaceMembers(workspace?.id)
  const { data: postShares } = usePostShare(postId)

  const loading = !workspace || !workspaceMembers || !user || !postShares

  if (!postId) {
    return { accessLevel: null, loading: false }
  }

  if (loading) {
    return { accessLevel: null, loading }
  }
}

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
