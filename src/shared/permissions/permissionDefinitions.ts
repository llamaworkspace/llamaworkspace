import { UserAccessLevel } from '@/shared/globalTypes'

export enum PermissionAction {
  View = 'view',
  Use = 'use',
  Update = 'update',
  Share = 'share',
  Delete = 'delete',
}

export interface PermissionActionKind {
  view: boolean
  use: boolean
  update: boolean
  share: boolean
  delete: boolean
}

const buildPermissionKind = (
  partialKind: Partial<PermissionActionKind>,
): PermissionActionKind => {
  return {
    view: false,
    use: false,
    update: false,
    share: false,
    delete: false,
    ...partialKind,
  }
}

export const PermissionsByAccessLevel: Record<
  UserAccessLevel,
  PermissionActionKind
> = {
  [UserAccessLevel.Owner]: buildPermissionKind({
    view: true,
    use: true,
    update: true,
    share: true,
    delete: true,
  }),
  [UserAccessLevel.EditAndShare]: buildPermissionKind({
    view: true,
    use: true,
    update: true,
    share: true,
  }),
  [UserAccessLevel.Use]: buildPermissionKind({
    view: true,
    use: true,
  }),
  [UserAccessLevel.View]: buildPermissionKind({
    view: true,
  }),
}

export const canForAccessLevel = (
  action: PermissionAction,
  accessLevel: UserAccessLevel,
) => {
  return !!PermissionsByAccessLevel[accessLevel][action]
}
