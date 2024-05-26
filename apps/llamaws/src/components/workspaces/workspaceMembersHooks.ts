import { api } from '@/lib/api'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useSelf } from '../users/usersHooks'

export const useWorkspaceMembers = (workspaceId: string | undefined) => {
  const errorHandler = useErrorHandler()

  const { data: workspaceMembers, isLoading } =
    api.workspaces.getWorkspaceMembers.useQuery(
      { workspaceId: workspaceId! },
      {
        onError: errorHandler(),
        enabled: !!workspaceId,
      },
    )

  return { workspaceMembers, isLoading }
}

export const useInviteUserToWorkspace = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  return api.workspaces.inviteUserToWorkspace.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.workspaces.getWorkspaceMembers.invalidate()
    },
    retry: false,
  })
}

export const useRevokeWorkspaceMemberAccess = () => {
  const errorHandler = useErrorHandler()
  const { data: self } = useSelf()
  const utils = api.useContext()
  const navigation = useNavigation()

  return api.workspaces.revokeWorkspaceMemberAccess.useMutation({
    onError: errorHandler(),
    onSuccess: (_, variables) => {
      if (self?.id === variables.userId) {
        // If revoking self, invalidate the full router
        void utils.invalidate()
        void navigation.replace('/p')
      } else {
        void utils.workspaces.getWorkspaceMembers.invalidate()
      }
    },
  })
}

export const useCancelWorkspaceInvite = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  return api.workspaces.cancelInviteToWorkspace.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.workspaces.getWorkspaceMembers.invalidate()
    },
  })
}
