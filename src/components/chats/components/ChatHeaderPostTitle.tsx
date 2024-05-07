import { useCanExecuteActionForPost } from '@/components/permissions/permissionsHooks'
import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { usePostById, useUpdatePost } from '@/components/posts/postsHooks'
import { JoiaIcon24 } from '@/components/ui/icons/JoiaIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_API_DEBOUNCE_MS } from '@/shared/globalConfig'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { Emoji, type EmojiClickData } from 'emoji-picker-react'
import { useState } from 'react'

export const ChatHeaderPostTitle = ({ postId }: { postId?: string }) => {
  const { data: post, isLoading } = usePostById(postId)
  const [isEmojiEditable, setIsEmojiEditable] = useState(false)

  const { mutate: updatePost } = useUpdatePost(DEFAULT_API_DEBOUNCE_MS)

  const { can: canEdit } = useCanExecuteActionForPost(
    PermissionAction.Update,
    postId,
  )

  const handleSelectEmoji = (emoji: EmojiClickData) => {
    handleEmojiChange(emoji.unified)
    setIsEmojiEditable(false)
  }

  const handleEmojiChange = (emoji: string) => {
    if (!postId) return
    updatePost({ id: postId, emoji })
  }

  const handleTitleChange = (title: string) => {
    title = title.trim()

    if (!postId) return
    updatePost({ id: postId, title: title || null })
  }

  if (isLoading) {
    return <Skeleton className="h-5 w-96" />
  }

  return (
    <div className="flex w-full items-center gap-x-1 text-zinc-900">
      <div className="relative text-xl">
        <div>
          {post?.emoji ? (
            <div className="w-8">
              <Emoji unified={post.emoji} size={28} />
            </div>
          ) : (
            <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center text-[1.1rem] text-zinc-300">
              <JoiaIcon24 />
            </div>
          )}
        </div>
      </div>
      <div className="text-lg font-semibold tracking-tighter">
        {post?.title ?? EMPTY_POST_NAME}
      </div>
    </div>
  )
}
