import { usePostById } from '@/components/posts/postsHooks'
import { JoiaIcon24 } from '@/components/ui/icons/JoiaIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { Emoji } from 'emoji-picker-react'
import ReactMarkdown from 'react-markdown'
import { useChatById, useMessages, usePostConfigForChat } from '../chatHooks'

export const ChatMessageInitial = ({ chatId }: { chatId?: string }) => {
  const { data: postConfig } = usePostConfigForChat(chatId)
  const { data: chat } = useChatById(chatId)
  const { data: post } = usePostById(chat?.postId)
  const { data: messages } = useMessages(chatId)

  const isLoading = !postConfig || !chat || !post || !messages
  const hasTitleOrInitialMessage = post?.title ?? postConfig?.description

  if (isLoading || messages.length) {
    return null
  }

  return (
    <div className="mt-48 w-full space-y-4">
      <div className="space-y-2">
        <div className="h-16">
          {isLoading && <Skeleton className="h-14 w-14" />}
          {!isLoading && hasTitleOrInitialMessage && (
            <>
              {post?.emoji ? (
                <Emoji unified={post.emoji} size={54} />
              ) : (
                <div className="inline-flex h-16 w-16 text-zinc-300">
                  <JoiaIcon24 className="h-16 w-16" />
                </div>
              )}
            </>
          )}
        </div>
        <div className="text-3xl font-bold tracking-tighter text-zinc-900">
          {isLoading && <Skeleton className="h-8 w-96" />}
          {!isLoading && post?.title && <>{post.title}</>}
        </div>
      </div>
      <div className="max-w-3xl space-y-4 text-[1.05rem]">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-3/6" />
          </div>
        )}
        {!isLoading && postConfig?.description && (
          <ReactMarkdown remarkPlugins={[]}>
            {postConfig.description}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}
