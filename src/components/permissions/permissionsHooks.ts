import { getEnumByValue } from '@/lib/utils'
import { UserAccessLevel } from '@/shared/globalTypes'
import {
  canForAccessLevel,
  type PermissionAction,
} from '@/shared/permissions/permissionDefinitions'
import { usePostShares } from '../posts/postsHooks'
import { useSelf } from '../users/usersHooks'
import { WorkspaceMemberRole } from '../workspaces/backend/workspacesBackendUtils'
import { useWorkspaceMembers } from '../workspaces/workspaceMembersHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'

export const useAccessLevelForPost = (postId?: string) => {
  const { data: user } = useSelf()
  const { workspace } = useCurrentWorkspace()
  const { workspaceMembers } = useWorkspaceMembers(workspace?.id)
  const { data: postShares } = usePostShares(postId)

  const loading = !workspace || !workspaceMembers || !user || !postShares

  if (!postId) {
    return { accessLevel: null, loading: false }
  }

  if (loading) {
    return { accessLevel: null, loading }
  }

  const currentMember = workspaceMembers.find((member) => member.id === user.id)

  if (currentMember) {
    return {
      accessLevel:
        currentMember.role === WorkspaceMemberRole.Owner
          ? UserAccessLevel.Owner
          : UserAccessLevel.EditAndShare,
      loading,
    }
  }

  const targetPostShare = postShares.find((ps) => ps.userId === user.id)

  if (!targetPostShare) {
    return { accessLevel: null, loading }
  }
  const accessLevel = getEnumByValue(
    UserAccessLevel,
    targetPostShare.accessLevel,
  )

  return { accessLevel, loading }
}

export const useCanExecuteActionForPost = (
  action: PermissionAction,
  postId?: string,
) => {
  const { data: user } = useSelf()
  const { accessLevel, loading: loadingAccessLevel } =
    useAccessLevelForPost(postId)

  const loading = !user || loadingAccessLevel

  if (!postId) {
    return { can: null, loading: false }
  }

  if (!accessLevel) {
    return { can: null, loading }
  }

  return { can: canForAccessLevel(action, accessLevel), loading }
}
