import { createTRPCRouter } from '@/server/trpc/trpc'
import { workspacesCancelInvite } from './procedures/workspacesCancelInvite'
import { workspacesGetWorkspaceMembers } from './procedures/workspacesGetWorkspaceMembers'
import { workspacesGetWorkspaceProperties } from './procedures/workspacesGetWorkspaceProperties'
import { workspacesGetWorkspaces } from './procedures/workspacesGetWorkspaces'
import { workspacesInviteUserToWorkspace } from './procedures/workspacesInviteUserToWorkspace'
import { workspacesRevokeWorkspaceMemberAccess } from './procedures/workspacesRevokeWorkspaceMemberAccess'
import { workspacesUpdateUserRole } from './procedures/workspacesUpdateUserRole'
import { workspacesUpdateWorkspace } from './procedures/workspacesUpdateWorkspace'

export const workspacesRouter = createTRPCRouter({
  getWorkspaces: workspacesGetWorkspaces,
  getWorkspaceMembers: workspacesGetWorkspaceMembers,
  getWorkspaceProperties: workspacesGetWorkspaceProperties,
  updateWorkspace: workspacesUpdateWorkspace,
  updateUserRoleForWorkspace: workspacesUpdateUserRole,
  inviteUserToWorkspace: workspacesInviteUserToWorkspace,
  cancelInviteToWorkspace: workspacesCancelInvite,
  revokeWorkspaceMemberAccess: workspacesRevokeWorkspaceMemberAccess,
})
