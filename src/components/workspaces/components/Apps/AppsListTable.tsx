import { useDeletePost, usePosts } from '@/components/posts/postsHooks'
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { useState } from 'react'
import { AppsListRow } from './AppsListRow'

export const AppsListTable = () => {
  const { data: posts } = usePosts()
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

  const handlePostDeletionCancellation = () => {
    setDeleteModalTargetPostId(null)
  }

  return (
    <div className="space-y-1">
      {posts?.map((post) => {
        return (
          <AppsListRow
            key={post.id}
            post={post}
            onRowDelete={handlePostDeletetionRequest}
          />
        )
      })}
      <DeleteConfirmationDialog
        title="Delete GPT"
        description="Are you sure you want to delete this GPT? This action cannot be
              undone."
        isOpen={!!deleteModalTargetPostId}
        onCancel={handlePostDeletionCancellation}
        onConfirm={handlePostDelete}
      />
    </div>
  )
}
