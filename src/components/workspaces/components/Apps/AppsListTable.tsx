import {
  useAppsForAppsList,
  useDeleteApp,
  useDuplicateApp,
} from '@/components/apps/appsHooks'
import { useCanPerformActionForAppIds } from '@/components/permissions/permissionsHooks'
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { useState } from 'react'
import { AppsListRow } from './AppsListRow'

export const AppsListTable = () => {
  const { data: apps } = useAppsForAppsList()

  const appIds = apps?.map((app) => app.id)

  const { data: appsAndCanDeletePermission } = useCanPerformActionForAppIds(
    PermissionAction.Delete,
    appIds,
  )

  const [deleteModalTargetAppId, setDeleteModalTargetAppId] = useState<
    string | null
  >(null)

  const { mutateAsync: deleteApp } = useDeleteApp()
  const { mutateAsync: duplicateApp } = useDuplicateApp()
  const successToast = useSuccessToast()

  const handleAppDeletionRequest = (appId: string) => {
    setDeleteModalTargetAppId(appId)
  }

  const handleAppDuplication = (appId: string) => {
    void duplicateApp({ appId })
  }

  const handleAppDelete = () => {
    async function _doAppDeletion() {
      if (!deleteModalTargetAppId!) {
        return
      }
      await deleteApp(
        { id: deleteModalTargetAppId },
        {
          onSuccess: () => {
            successToast(undefined, 'App successfully deleted')
          },
        },
      )
      setDeleteModalTargetAppId(null)
    }
    void _doAppDeletion()
  }

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

        // Just a guard clause to prevent undefined from being passed to the row
        if (canDelete === undefined) {
          canDelete = false
        }

        return (
          <AppsListRow
            key={app.id}
            app={app}
            canDelete={canDelete}
            onDelete={handleAppDeletionRequest}
            canDuplicate={true}
            onDuplicate={handleAppDuplication}
          />
        )
      })}
      <DeleteConfirmationDialog
        title="Delete app"
        description="Are you sure you want to delete this app? This action cannot be
              undone."
        isOpen={!!deleteModalTargetAppId}
        onCancel={() => setDeleteModalTargetAppId(null)}
        onConfirm={handleAppDelete}
      />
    </div>
  )
}
