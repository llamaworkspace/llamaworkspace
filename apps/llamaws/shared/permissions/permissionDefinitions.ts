import { UserAccessLevel } from 'shared/globalTypes'

export enum PermissionAction {
  Update = 'update',
  Delete = 'delete',
  Invite = 'invite',
  Use = 'use',
}

export interface PermissionActionKind {
  update: boolean
  delete: boolean
  invite: boolean
  use: boolean
}

// Returns an object where all PermissionActions are false by default, unless they are set to true in the partialKind
const buildPermissionKind = (
  partialKind: Partial<PermissionActionKind>,
): PermissionActionKind => {
  return Object.values(PermissionAction).reduce((acc, action) => {
    return {
      ...acc,
      [action]: !!partialKind[action],
    }
  }, {} as PermissionActionKind)
}

export const PermissionsByAccessLevel: Record<
  UserAccessLevel,
  PermissionActionKind
> = {
  [UserAccessLevel.Owner]: buildPermissionKind({
    update: true,
    delete: true,
    invite: true,
    use: true,
  }),
  [UserAccessLevel.Edit]: buildPermissionKind({
    update: true,
    invite: true,
    use: true,
  }),
  [UserAccessLevel.EditWithoutInvite]: buildPermissionKind({
    update: true,
    use: true,
  }),
  [UserAccessLevel.Invite]: buildPermissionKind({
    invite: true,
    use: true,
  }),

  [UserAccessLevel.Use]: buildPermissionKind({
    use: true,
  }),
}

export const canForAccessLevel = (
  action: PermissionAction,
  accessLevel: UserAccessLevel,
): boolean => {
  return !!PermissionsByAccessLevel[accessLevel][action]
}
