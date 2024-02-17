import { useCanExecuteActionForPost } from '@/components/permissions/permissionsHooks'
import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { usePostById, useUpdatePost } from '@/components/posts/postsHooks'
import { Editable } from '@/components/ui/Editable'
import { JoiaIcon } from '@/components/ui/icons/JoiaIcon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_API_DEBOUNCE_MS } from '@/shared/globalConfig'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import EmojiPicker, { Emoji, type EmojiClickData } from 'emoji-picker-react'
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
    <div className="relative">
      <Popover open={isEmojiEditable} onOpenChange={setIsEmojiEditable}>
        <div className="flex w-full items-center gap-x-1 text-zinc-900">
          <div className="relative text-xl">
            <PopoverTrigger asChild>
              <div>
                {post?.emoji ? (
                  <div className="w-8 cursor-pointer">
                    <Emoji unified={post.emoji} size={28} />
                  </div>
                ) : (
                  <div className="mr-2 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center text-[1.1rem] text-zinc-300">
                    <JoiaIcon />
                  </div>
                )}
              </div>
            </PopoverTrigger>

            <PopoverContent className="w-[332px] p-0">
              <EmojiPicker
                width={330}
                previewConfig={{ showPreview: false }}
                searchDisabled
                onEmojiClick={handleSelectEmoji}
              />
            </PopoverContent>
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
      </Popover>
    </div>
  )
}
