import { useAppsForAppsList, useDeleteApp } from '@/components/apps/postsHooks'
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { useState } from 'react'
import { AppsListRow } from './AppsListRow'

export const AppsListTable = () => {
  const { data: apps } = useAppsForAppsList()
  const [deleteModalTargetAppId, setDeleteModalTargetAppId] = useState<
    string | null
  >(null)

  const { mutateAsync: deleteApp } = useDeleteApp()
  const successToast = useSuccessToast()

  const handleAppDeletetionRequest = (appId: string) => {
    setDeleteModalTargetAppId(appId)
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
            successToast(undefined, 'GPT successfully deleted')
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
          You currently don&apos;t have any GPTs. Go ahead and create your first
          one.
        </div>
      </>
    )
  }

  return (
    <div className="space-y-1">
      {apps?.map((app) => {
        return (
          <AppsListRow
            key={app.id}
            app={app}
            onRowDelete={handleAppDeletetionRequest}
          />
        )
      })}
      <DeleteConfirmationDialog
        title="Delete GPT"
        description="Are you sure you want to delete this GPT? This action cannot be
              undone."
        isOpen={!!deleteModalTargetAppId}
        onCancel={() => setDeleteModalTargetAppId(null)}
        onConfirm={handleAppDelete}
      />
    </div>
  )
}
