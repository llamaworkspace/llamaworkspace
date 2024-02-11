import { useCanExecuteActionForPost } from '@/components/permissions/permissionsHooks'
import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { usePostById, useUpdatePost } from '@/components/posts/postsHooks'
import { Editable } from '@/components/ui/Editable'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_API_DEBOUNCE_MS } from '@/shared/globalConfig'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import EmojiPicker, { Emoji } from 'emoji-picker-react'

export const ChatHeaderPostTitle = ({ postId }: { postId?: string }) => {
  const { data: post, isLoading } = usePostById(postId)

  const { mutate: updatePost } = useUpdatePost(DEFAULT_API_DEBOUNCE_MS)

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
    <div className="relative">
      <div className="flex w-full items-center gap-x-1 text-zinc-900">
        <div className="bg-zinc-100x relative px-2 py-1 text-xl">
          <div>
            <Emoji unified="1f423" size="25" />
          </div>
          <div>
            <div className="hiddenx absolute left-0 top-9 z-50">
              <EmojiPicker
                style={{
                  '--epr-emoji-fullsize': '12px',
                  '--epr-emoji-size': '12px',
                }}
                open={true}
                width={300}
                previewConfig={{ showPreview: false }}
                searchDisabled
              />
            </div>
          </div>
        </div>
        <Editable
          onChange={handleTitleChange}
          tagName="h1"
          className="text-lg font-semibold tracking-tighter"
          placeholder={EMPTY_POST_NAME}
          initialValue={post?.title}
          disabled={!canEdit}
        />
      </div>
    </div>
  )
}
