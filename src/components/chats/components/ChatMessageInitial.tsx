import { usePostById } from '@/components/posts/postsHooks'
import { JoiaIcon } from '@/components/ui/icons/JoiaIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Emoji } from 'emoji-picker-react'
import ReactMarkdown from 'react-markdown'
import { useChatById, useMessages, usePostConfigForChat } from '../chatHooks'

export const ChatMessageInitial = ({ chatId }: { chatId?: string }) => {
  const { data: postConfig } = usePostConfigForChat(chatId)
  const { data: chat } = useChatById(chatId)
  const { data: post } = usePostById(chat?.postId)
  const { data: messages } = useMessages(chatId)

  const isLoading = !postConfig || !chat || !post || !messages
  const hasTitleOrInitialMessage = post?.title ?? postConfig?.initialMessage

  if (isLoading || messages.length) {
    return null
  }

  return (
    <div className="h-full">
      <div
        className={cn(
          'flex h-full w-full transform items-center transition duration-300 ease-in-out',
        )}
      >
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <div className="h-16">
              {isLoading && <Skeleton className="h-14 w-14" />}
              {!isLoading && hasTitleOrInitialMessage && (
                <>
                  {post?.emoji ? (
                    <Emoji unified={post.emoji} size={54} />
                  ) : (
                    <div className="inline-flex h-16 w-16 text-zinc-200">
                      <JoiaIcon />
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
            {!isLoading && postConfig?.initialMessage && (
              <ReactMarkdown remarkPlugins={[]}>
                {postConfig.initialMessage}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
