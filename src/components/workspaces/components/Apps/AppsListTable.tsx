import {
  useDeletePost,
  usePostsForAppsList,
} from '@/components/posts/postsHooks'
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { useState } from 'react'
import { AppsListRow } from './AppsListRow'

export const AppsListTable = () => {
  const { data: apps } = usePostsForAppsList()
  const [deleteModalTargetPostId, setDeleteModalTargetPostId] = useState<
    string | null
  >(null)

  const { mutateAsync: deletePost } = useDeletePost()
  const successToast = useSuccessToast()

  const handlePostDeletetionRequest = (postId: string) => {
    setDeleteModalTargetPostId(postId)
  }

  const handlePostDelete = () => {
    async function _doPostDeletion() {
      if (!deleteModalTargetPostId!) {
        return
      }
      await deletePost(
        { id: deleteModalTargetPostId },
        {
          onSuccess: () => {
            successToast(undefined, 'GPT successfully deleted')
          },
        },
      )
      setDeleteModalTargetPostId(null)
    }
    void _doPostDeletion()
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
            onRowDelete={handlePostDeletetionRequest}
          />
        )
      })}
      <DeleteConfirmationDialog
        title="Delete GPT"
        description="Are you sure you want to delete this GPT? This action cannot be
              undone."
        isOpen={!!deleteModalTargetPostId}
        onCancel={() => setDeleteModalTargetPostId(null)}
        onConfirm={handlePostDelete}
      />
    </div>
  )
}
