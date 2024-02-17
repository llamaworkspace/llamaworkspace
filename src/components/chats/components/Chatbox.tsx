import { useCanExecuteActionForPost } from '@/components/permissions/permissionsHooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useEnterSubmit } from '@/lib/frontend/useEnterSubmit'
import { cn } from '@/lib/utils'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useRef, useState } from 'react'
import _ from 'underscore'
import { useMessages, usePrompt } from '../chatHooks'
import { CreateNewChat } from './CreateNewChat/CreateNewChat'

const MAX_HEIGHT = 200

interface ChatProps {
  postId?: string
  chatId?: string
  stableOnChatboxHeightChange?: (height: number) => void
}

export function Chatbox({
  postId,
  chatId,
  stableOnChatboxHeightChange,
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

  const { can: canUse } = useCanExecuteActionForPost(
    PermissionAction.Use,
    postId,
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

  const handleReset = () => {
    setValue('')
    textareaRef.current?.focus()
  }

  const showSkeleton = !chatId

  return (
    <div className="mx-auto max-w-4xl bg-white px-2 pb-4 pt-2 lg:px-0">
      {showSkeleton ? (
        <Skeleton className="h-14 w-full" />
      ) : (
        <form onSubmit={handleSubmit} ref={formRef}>
          <div
            className={cn(
              'flex items-center gap-x-2 rounded-md border border-sand-mid bg-white p-2',
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
                <ArrowRightCircleIcon className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </form>
      )}
      <div className="mt-2 flex justify-between text-xs tracking-tight">
        <CreateNewChat
          postId={postId}
          chatId={chatId}
          loading={showSkeleton}
          onSuccess={handleReset}
        />
        {showSkeleton ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          <div className="text-zinc-400">
            <span className="font-semibold">Shift + Enter</span> &nbsp;to add a
            new line
          </div>
        )}
      </div>
    </div>
  )
}
