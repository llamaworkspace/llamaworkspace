import { cn, getEnumByValue } from '@/lib/utils'
import { Author } from '@/shared/aiTypesAndMappers'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { isBoolean } from 'underscore'
import { useIsDefaultApp } from '../../apps/appsHooks'
import { useGlobalState } from '../../global/globalState'
import { useMessages } from '../chatHooks'
import { ChatMessage } from './ChatMessage'
import { ChatMessageInitial } from './ChatMessageInitial'
import { Chatbox } from './Chatbox'

interface ChatProps {
  appId?: string
  chatId?: string
}

const LAST_BLOCK_HEIGHT_INCREMENTS = 24
const LAST_BLOCK_MIN_HEIGHT = 80

const scrollToBottom = (
  element: HTMLDivElement,
  speed: 'smooth' | 'instant' = 'instant',
) => {
  element.scrollIntoView({ behavior: speed })
}

export function Chat({ appId, chatId }: ChatProps) {
  const { state } = useGlobalState()
  const { isDesktopSidebarOpen } = state
  const { data: messages } = useMessages(chatId)
  const isDefaultApp = useIsDefaultApp(appId)
  const [lastBlockHeight, setLastBlockHeight] = useState(LAST_BLOCK_MIN_HEIGHT)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollEnabled = useRef(true)
  const [autoScrollEnabledState, setAutoScrollEnabledState] = useState(true)
  const router = useRouter()

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

  const performSmoothScrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      scrollToBottom(messagesEndRef.current, 'smooth')
      autoScrollEnabled.current = true
      setAutoScrollEnabledState(true)
    }
  }, [messagesEndRef])

  const handleLineHeightChange = useCallback(() => {
    // Only perform it when the user is at the bottom
    if (!autoScrollEnabled.current) return

    if (chatContainerRef.current && messagesEndRef.current) {
      scrollToBottom(messagesEndRef.current, 'instant')
      autoScrollEnabled.current = true
      setAutoScrollEnabledState(true)
    }
  }, [])

  // This effect controls whether the UI should autoscroll.
  // It only autoscrolls if the user is at the bottom of the chat.
  useEffect(() => {
    if (!chatContainerRef.current) {
      return
    }
    const handleScroll = () => {
      if (!chatContainerRef.current) {
        return
      }

      // Determine if the user is scrolling up
      const isScrollAtBottom = !(
        (
          chatContainerRef.current.scrollTop +
            chatContainerRef.current.clientHeight <
          chatContainerRef.current.scrollHeight - 2
        ) // Keep a small margin of 2px
      )

      autoScrollEnabled.current = isScrollAtBottom
      setAutoScrollEnabledState(isScrollAtBottom)
    }

    chatContainerRef.current.addEventListener('scroll', handleScroll)
    const _chatContainer = chatContainerRef.current

    return () => {
      _chatContainer.removeEventListener('scroll', handleScroll)
    }
    // Router.asPath is used to force a re-link with chatContainerRef, otherwise nextjs route changes causes issues: the container is removed from the DOM but this listener isn't remounted.
  }, [router.asPath])

  // If no messages, never show the arrow. For example, in chatbots intro message: Do not show
  const showScrollToBottomIcon = !!(messages?.length && !autoScrollEnabledState)
  const refreshKey = `${appId}-${chatId}`

  return (
    <div
      // Important: Keep this key here to force a remount
      // of the component on all route changes.
      // Important: Keep "flex flex-col" for the scrolling to work
      key={refreshKey}
      ref={chatContainerRef}
      className="relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden"
    >
      <div className="mx-auto h-full w-full max-w-chat px-4 lg:px-0">
        {isBoolean(isDefaultApp) && !isDefaultApp && (
          <ChatMessageInitial chatId={chatId} />
        )}

        <div className="space-y-8 pt-8">
          {messages?.map((message, index) => {
            const author = getEnumByValue(Author, message.author) as
              | Author.User
              | Author.Assistant

            const isLastMessage = index === messages.length - 1
            return (
              <ChatMessage
                key={index} // Keep index, otherwise changes in message.id (temp vs final) trigger a re-mount that causes a flicker
                message={message.message ?? ''}
                author={author}
                onLineHeightChange={
                  isLastMessage ? handleLineHeightChange : undefined
                }
              />
            )
          })}
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
            appId={appId}
            chatId={chatId}
            stableOnChatboxHeightChange={handleChatboxHeightChangeStable}
            onChatSubmit={performSmoothScrollToBottom}
            showScrollToBottomIcon={showScrollToBottomIcon}
            onScrollToBottomIconClick={performSmoothScrollToBottom}
          />
        </div>

        {/* This div is used for scrolling */}
        <div
          id="messagesEndAnchor"
          ref={messagesEndRef}
          className="h-0 max-h-0"
        ></div>
      </div>
    </div>
  )
}
