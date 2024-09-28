import { useAppsForAppsList } from '@/components/apps/appsHooks'
import { useCanPerformActionForAppIds } from '@/components/permissions/permissionsHooks'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { AppsListRow } from './AppsListRow'

export const AppsListTable = () => {
  const { data: apps } = useAppsForAppsList()

  const appIds = apps?.map((app) => app.id)

  // Do it in bulk to prevent n+1 queries
  const { data: appsAndCanDeletePermission } = useCanPerformActionForAppIds(
    PermissionAction.Delete,
    appIds,
  )
  const { data: appsCanUsePermission } = useCanPerformActionForAppIds(
    PermissionAction.Use,
    appIds,
  )

  if (apps && !apps.length) {
    return (
      <>
        <div className="pt-16 text-center text-zinc-600">
          You currently don&apos;t have any apps. Go ahead and create your first
          one.
        </div>
      </>
    )
  }

  return (
    <div className="space-y-1">
      {apps?.map((app) => {
        let canDelete = appsAndCanDeletePermission?.find(
          (item) => item.id === app.id,
        )?.can

        let canDuplicate = appsCanUsePermission?.find(
          (item) => item.id === app.id,
        )?.can

        // Just some guard clauses to prevent undefined from being passed to the row
        if (canDelete === undefined) {
          canDelete = false
        }

        if (canDuplicate === undefined) {
          canDuplicate = false
        }

        return (
          <AppsListRow
            key={app.id}
            app={app}
            canDelete={canDelete}
            canDuplicate={canDuplicate}
          />
        )
      })}
    </div>
  )
}
