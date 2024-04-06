import { cn } from '@/lib/utils'
import { ChatAuthor } from '@/shared/aiTypesAndMappers'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import _, { isBoolean } from 'underscore'
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const autoScroll = useRef(true)

  const scrollToBottom = useMemo(() => {
    const func = () => {
      console.log('called')
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
    }
    return _.throttle(func, 500)
  }, [messagesEndRef])

  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return
      // Determine if the user is scrolling up
      const isScrollingUp =
        chatContainerRef.current.scrollTop +
          chatContainerRef.current.clientHeight <
        chatContainerRef.current.scrollHeight
      console.log('isScrollingUp', isScrollingUp)
      autoScroll.current = !autoScroll.current
    }

    const chatContainer = chatContainerRef.current
    chatContainer?.addEventListener('scroll', handleScroll)
    chatContainer?.addEventListener('scroll', (ev) => {
      console.log('scrolling', ev)
    })

    return () => chatContainer?.removeEventListener('scroll', handleScroll)
  }, []) // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    if (autoScroll.current) {
      scrollToBottom()
    }
  }, [messages])

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
      // Important: Keep "flex flex-col" for the scrolling to work
      key={refreshKey}
      ref={chatContainerRef}
      className="bg-pink relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden pt-12"
    >
      <div className="mx-auto w-full max-w-4xl px-4 lg:px-0">
        <ChatNoSettingsAlert postId={postId} chatId={chatId} />

        {isBoolean(isDefaultPost) && !isDefaultPost && (
          <ChatMessageInitial chatId={chatId} />
        )}

        <div className="space-y-6">
          <div className="h-[20px]"></div>
          {/* Do not revert on every re-render, do Server Side */}
          {messages
            ?.map((message, index) => {
              return (
                <ChatMessage
                  variant={getVariant(message.author)}
                  key={index} // Keep index, otherwise changes in message.id (temp vs final) trigger a re-mount that causes a flicker
                  message={message.message ?? ''}
                  author={getAuthor(message.author) ?? ''}
                />
              )
            })
            .reverse()}
          <div className="h-[16px]"></div>
        </div>
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

      {/* This div is used for scrolling */}
      <div ref={messagesEndRef}></div>
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
