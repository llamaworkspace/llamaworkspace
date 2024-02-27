import { cn } from '@/lib/utils'
import { ChatAuthor } from '@/shared/aiTypesAndMappers'
import { useCallback, useState } from 'react'
import { isBoolean } from 'underscore'
import { useGlobalState } from '../global/globalState'
import { useIsDefaultPost } from '../posts/postsHooks'
import { useMessages } from './chatHooks'
import { ChatMessage } from './components/ChatMessage'
import { ChatMessageInitial } from './components/ChatMessageInitial'
import { ChatNoSettingsAlert } from './components/ChatNoSettingsAlert'
import { Chatbox } from './components/Chatbox'

interface ChatProps {
  postId?: string
  chatId?: string
}

const LAST_BLOCK_HEIGHT_INCREMENTS = 24
const LAST_BLOCK_MIN_HEIGHT = 80

export function Chat({ postId, chatId }: ChatProps) {
  const { state } = useGlobalState()
  const { isDesktopSidebarOpen } = state
  const { data: messages } = useMessages(chatId)
  const isDefaultPost = useIsDefaultPost(postId)
  const [lastBlockHeight, setLastBlockHeight] = useState(LAST_BLOCK_MIN_HEIGHT)

  const handleChatboxHeightChangeStable = useCallback((height: number) => {
    const lines = height / 24 || 1
    const nextHeight = (function () {
      if (lines === 1) return LAST_BLOCK_MIN_HEIGHT
      if (lines === 2)
        return LAST_BLOCK_MIN_HEIGHT + LAST_BLOCK_HEIGHT_INCREMENTS / 2
      return (
        LAST_BLOCK_MIN_HEIGHT + (lines - 1.5) * LAST_BLOCK_HEIGHT_INCREMENTS
      )
    })()

    setLastBlockHeight(nextHeight)
  }, [])

  const refreshKey = `${postId}-${chatId}`

  return (
    <div
      // Important: Keep this key here to force a remount
      // of the component on all route changes.
      key={refreshKey}
      className="relative flex h-full w-full flex-1 flex-col-reverse overflow-y-auto overflow-x-hidden bg-white py-4"
    >
      <div className="mx-auto flex w-full max-w-4xl grow flex-col gap-y-4 px-2 pb-4 lg:px-0">
        <div className="grow">
          <ChatNoSettingsAlert postId={postId} chatId={chatId} />
        </div>
        {isBoolean(isDefaultPost) && !isDefaultPost && (
          <ChatMessageInitial chatId={chatId} />
        )}
        <div className="h-[32px]"></div>
        {messages
          ?.map((message) => {
            return (
              <ChatMessage
                variant={getVariant(message.author)}
                key={message.id}
                message={message.message ?? ''}
                author={getAuthor(message.author) ?? ''}
              />
            )
          })
          .reverse()}

        <div style={{ minHeight: lastBlockHeight }}></div>

        {/* Chatbox here */}
        <div
          className={cn(
            'transition-spacing fixed bottom-0 left-0 w-full duration-200 ease-out',
            isDesktopSidebarOpen && 'lg:pl-72',
          )}
        >
          <Chatbox
            postId={postId}
            chatId={chatId}
            stableOnChatboxHeightChange={handleChatboxHeightChangeStable}
          />
        </div>
      </div>
    </div>
  )
}

function getAuthor(author: string) {
  if (author === (ChatAuthor.Assistant as string)) {
    return 'Assistant'
  }
  return 'You'
}

function getVariant(author: string) {
  if (author === (ChatAuthor.Assistant as string)) {
    return 'assistant'
  }
  return 'user'
}
