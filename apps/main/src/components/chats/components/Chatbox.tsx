import { useCanPerformActionForApp } from '@/components/permissions/permissionsHooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useEnterSubmit } from '@/lib/frontend/useEnterSubmit'
import { cn } from '@/lib/utils'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { useCallback, useEffect, useRef, useState } from 'react'
import _ from 'underscore'
import { useMessages, usePrompt } from '../chatHooks'

const MAX_HEIGHT = 200

interface ChatProps {
  appId?: string
  chatId?: string
  stableOnChatboxHeightChange?: (height: number) => void
  onChatSubmit?: () => void
  showScrollToBottomIcon?: boolean
  onScrollToBottomIconClick?: () => void
}

export function Chatbox({
  appId,
  chatId,
  stableOnChatboxHeightChange,
  onChatSubmit,
  showScrollToBottomIcon = false,
  onScrollToBottomIconClick,
}: ChatProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const divRef = useRef<HTMLDivElement>(null)
  const [textAreaExpectedHeight, __setTextAreaExpectedHeight] = useState(24) // do not use __setTextAreaExpectedHeight directly
  const [value, setValue] = useState('')
  const { data: messages } = useMessages(chatId)
  const { mutate: runPrompt, isLoading } = usePrompt(chatId)

  const setTextAreaExpectedHeight = useCallback(
    (height: number) => {
      if (height === textAreaExpectedHeight) return
      stableOnChatboxHeightChange?.(height)
      __setTextAreaExpectedHeight(height)
    },
    [textAreaExpectedHeight, stableOnChatboxHeightChange],
  )

  useEffect(() => {
    stableOnChatboxHeightChange?.(textAreaExpectedHeight)
  }, [stableOnChatboxHeightChange, textAreaExpectedHeight])

  const { data: canUse } = useCanPerformActionForApp(
    PermissionAction.Use,
    appId,
  )

  useEffect(() => {
    if (canUse) {
      textareaRef.current?.focus()
    }
  }, [canUse, chatId])

  // Effect to evaluate the height of the textarea and notify changes
  // when value changes.
  // useEffect runs after the render is committed to the screen, so we can
  // safely read the height of the shadow textarea (a.k.a. divRef).
  useEffect(() => {
    if (!divRef.current || !textareaRef.current) {
      return
    }

    if (divRef.current.scrollHeight === 0) {
      return
    }
    if (
      textareaRef.current.scrollHeight > divRef.current.scrollHeight &&
      divRef.current.scrollHeight < MAX_HEIGHT
    ) {
      setTextAreaExpectedHeight(divRef.current.scrollHeight)
    }
  }, [value, setTextAreaExpectedHeight])

  const placeholder = (function () {
    if (_.isNull(canUse) || _.isUndefined(canUse)) {
      return
    }
    if (canUse === false)
      return "You don't have enough permissions to use this chatbot"
    if (!messages) return ''
    if (messages.length === 0) return 'Start chatting...'
    return 'Continue chatting...'
  })()

  let trackingDivValue = value || ' '
  // Adds a non-breaking space to the end of the string to make sure the
  // tracking div has the same height as the textarea when a new line is added
  // to the textarea.
  trackingDivValue = trackingDivValue.replace(/\n$/, '\n\u00A0')

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    onChatSubmit?.()
    if (!chatId) return
    if (isLoading) return

    if (!value?.trim()) {
      return
    }
    setValue('')
    runPrompt(value)
  }

  const handleTextAreaChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(ev.target.value)
    if (!textareaRef.current) return

    const targetHeight =
      textareaRef.current.scrollHeight > MAX_HEIGHT
        ? MAX_HEIGHT
        : textareaRef.current.scrollHeight

    setTextAreaExpectedHeight(targetHeight)
  }

  const showSkeleton = !chatId

  return (
    <div className="relative mx-auto max-w-chat bg-white px-2 pb-2 lg:px-0">
      {showScrollToBottomIcon && (
        <div
          onClick={onScrollToBottomIconClick}
          className="absolute -top-14 right-0 h-10 w-10 cursor-pointer rounded "
        >
          <ArrowDownCircleIcon className="rounded-full bg-white text-zinc-800 hover:bg-zinc-100" />
        </div>
      )}
      {showSkeleton ? (
        <Skeleton className="h-14 w-full" />
      ) : (
        <form onSubmit={handleSubmit} ref={formRef}>
          <div
            className={cn(
              'flex items-center gap-x-2 rounded-md border border-zinc-200 bg-white p-2',
              !canUse && 'cursor-not-allowed bg-zinc-100',
              _.isNull(canUse) && 'cursor-not-allowed border-zinc-200 bg-white',
            )}
          >
            <div className="relative flex h-full w-full justify-center">
              <textarea
                disabled={!canUse}
                ref={textareaRef}
                rows={1}
                placeholder={placeholder}
                className={cn(
                  'm-0 h-auto w-full resize-none overflow-y-auto p-0 text-zinc-900 outline-none focus:ring-0 focus-visible:ring-0',
                  canUse === false && 'cursor-not-allowed bg-zinc-100',
                  _.isNull(canUse) && 'cursor-not-allowed bg-white',
                )}
                style={{
                  maxHeight: textAreaExpectedHeight,
                  height: textAreaExpectedHeight,
                }}
                onChange={handleTextAreaChange}
                onKeyDown={onKeyDown}
                value={value}
              />
              {/* Shadow textarea */}
              <div
                ref={divRef}
                // Keep this and uncomment in dev to debugging the shadow textarea
                // className="absolute left-0 right-0 top-[-220px] overflow-hidden bg-pink-200"
                className="absolute h-0 max-h-0 overflow-hidden"
                style={{
                  whiteSpace: 'pre-wrap',
                }}
              >
                {trackingDivValue}
              </div>
            </div>
            <div className="self-end">
              <Button
                type="submit"
                disabled={!value || isLoading}
                variant="secondary"
              >
                <PaperAirplaneIcon className="h-5 w-5 text-zinc-600" />
              </Button>
            </div>
          </div>
        </form>
      )}
      <div className="mt-2 flex justify-end text-xs tracking-tight">
        <div className="text-zinc-400">
          <span className="font-semibold">Shift + Enter</span> &nbsp;to add a
          new line
        </div>
      </div>
    </div>
  )
}
