import { createTRPCRouter } from '@/server/trpc/trpc'
import { workspacesCancelInvite } from './procedures/workspacesCancelInvite'
import { workspacesGetWorkspaceMembers } from './procedures/workspacesGetWorkspaceMembers'
import { workspacesGetWorkspaces } from './procedures/workspacesGetWorkspaces'
import { workspacesInviteUserToWorkspace } from './procedures/workspacesInviteUserToWorkspace'
import { workspacesRevokeWorkspaceMemberAccess } from './procedures/workspacesRevokeWorkspaceMemberAccess'
import { workspacesUpdateWorkspace } from './procedures/workspacesUpdateWorkspace'

export const workspacesRouter = createTRPCRouter({
  getWorkspaces: workspacesGetWorkspaces,
  getWorkspaceMembers: workspacesGetWorkspaceMembers,
  updateWorkspace: workspacesUpdateWorkspace,
  inviteUserToWorkspace: workspacesInviteUserToWorkspace,
  cancelInviteToWorkspace: workspacesCancelInvite,
  revokeWorkspaceMemberAccess: workspacesRevokeWorkspaceMemberAccess,
})
