import { z } from 'zod'

export const zodWorkspaceOutput = z.object({
  id: z.string(),
  name: z.string().nullable(),
})

export enum WorkspaceMemberRole {
  Owner = 'owner',
  Admin = 'admin',
}

export const zodWorkspaceMemberOutput = z.object({
  id: z.string().optional(),
  inviteId: z.string().optional(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  role: z.nativeEnum(WorkspaceMemberRole),
})

/**
 * Filter for workspaces that are visible to the user (Either member or shared)
 */
export const workspaceVisibilityFilter = (userId: string) => {
  return {
    users: {
      some: {
        userId,
      },
    },
  }
}

/**
 * Filter for workspaces that are editable by the user (Member)
 */
export const workspaceEditionFilter = (userId: string) => {
  return {
    users: {
      some: {
        userId,
      },
    },
  }
}
