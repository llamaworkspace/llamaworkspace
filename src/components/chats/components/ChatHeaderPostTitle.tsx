import { useCanExecuteActionForPost } from '@/components/permissions/permissionsHooks'
import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { usePostById, useUpdatePost } from '@/components/posts/postsHooks'
import { Editable } from '@/components/ui/Editable'
import { Skeleton } from '@/components/ui/skeleton'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'

export const ChatHeaderPostTitle = ({ postId }: { postId?: string }) => {
  const { data: post, isLoading } = usePostById(postId)

  const { mutate: updatePost } = useUpdatePost(300)

  const { can: canEdit } = useCanExecuteActionForPost(
    PermissionAction.Update,
    postId,
  )

  const handleTitleChange = (title: string) => {
    title = title.trim()

    if (!postId) return
    updatePost({ id: postId, title: title || null })
  }

  if (isLoading) {
    return <Skeleton className="h-5 w-96" />
  }

  return (
    <div className="flex w-full items-center gap-x-4 text-zinc-900">
      <Editable
        onChange={handleTitleChange}
        tagName="h1"
        className="text-lg font-semibold tracking-tighter"
        placeholder={EMPTY_POST_NAME}
        initialValue={post?.title}
        disabled={!canEdit}
      />
    </div>
  )
}
