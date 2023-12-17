import { UserAccessLevel } from '@/shared/globalTypes'

export enum PermissionAction {
  View = 'view',
  Use = 'use',
  Update = 'update',
  Share = 'share',
  Delete = 'delete',
}

export interface PermissionActionKind {
  view?: boolean
  use?: boolean
  update?: boolean
  share?: boolean
  delete?: boolean
}

export const PermissionsByAccessLevel: Record<
  UserAccessLevel,
  PermissionActionKind
> = {
  [UserAccessLevel.Owner]: {
    view: true,
    use: true,
    update: true,
    share: true,
    delete: true,
  },
  [UserAccessLevel.EditAndShare]: {
    view: true,
    use: true,
    update: true,
    share: true,
  },
  [UserAccessLevel.Use]: {
    view: true,
    use: true,
  },
  [UserAccessLevel.View]: {
    view: true,
  },
}

export const canForAccessLevel = (
  action: PermissionAction,
  accessLevel: UserAccessLevel,
) => {
  return !!PermissionsByAccessLevel[accessLevel][action]
}
