import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { usePostById } from '@/components/posts/postsHooks'
import { JoiaIcon24 } from '@/components/ui/icons/JoiaIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { Emoji } from 'emoji-picker-react'

export const ChatHeaderPostTitle = ({ postId }: { postId?: string }) => {
  const { data: post, isLoading } = usePostById(postId)

  if (isLoading) {
    return <Skeleton className="h-5 w-96" />
  }

  return (
    <div className="flex w-full items-center gap-x-1 text-zinc-900">
      <div className="relative text-xl">
        <div>
          {post?.emoji ? (
            <div className="w-12">
              <Emoji unified={post.emoji} size={36} />
            </div>
          ) : (
            <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center text-[1.1rem] text-zinc-300">
              <JoiaIcon24 />
            </div>
          )}
        </div>
      </div>
      <div className="text-xl font-bold tracking-tight">
        {post?.title ?? EMPTY_POST_NAME}
      </div>
    </div>
  )
}
