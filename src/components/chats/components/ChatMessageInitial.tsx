import { useAppById } from '@/components/apps/postsHooks'
import { JoiaIcon24 } from '@/components/ui/icons/JoiaIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { Emoji } from 'emoji-picker-react'
import ReactMarkdown from 'react-markdown'
import { useAppConfigForChat, useChatById, useMessages } from '../chatHooks'

export const ChatMessageInitial = ({ chatId }: { chatId?: string }) => {
  const { data: appConfig } = useAppConfigForChat(chatId)
  const { data: chat } = useChatById(chatId)
  const { data: app } = useAppById(chat?.appId)
  const { data: messages } = useMessages(chatId)

  const isLoading = !appConfig || !chat || !app || !messages
  const hasTitleOrInitialMessage = app?.title ?? appConfig?.description

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
              {app?.emoji ? (
                <Emoji unified={app.emoji} size={54} />
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
          {!isLoading && app?.title && <>{app.title}</>}
        </div>
      </div>
      <div className="max-w-3xl space-y-4 text-[1.05rem]">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-3/6" />
          </div>
        )}
        {!isLoading && appConfig?.description && (
          <ReactMarkdown remarkPlugins={[]}>
            {appConfig.description}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}
