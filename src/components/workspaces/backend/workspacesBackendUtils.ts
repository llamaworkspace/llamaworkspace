import { z } from 'zod'

export const zodWorkspaceOutput = z.object({
  id: z.string(),
  name: z.string().nullable(),
  balanceInCents: z.number(),
  openAiApiKey: z
    .string()
    .nullable()
    .transform((val) => {
      if (!val) return val
      return val?.slice(0, 5) + '••••••••••••••••' + val?.slice(-4)
    }),
})

export enum WorkspaceMemberRole {
  Owner = 'owner',
  Admin = 'admin',
}

export const zodWorkspaceMemberOutput = z.object({
  id: z.string(),
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
