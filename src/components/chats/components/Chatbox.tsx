import { useCanExecuteActionForPost } from '@/components/permissions/permissionsHooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useEnterSubmit } from '@/lib/frontend/useEnterSubmit'
import { cn } from '@/lib/utils'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { ArrowRightCircleIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react'
import _ from 'underscore'
import { useCreateChat, useMessages, usePrompt } from '../chatHooks'

const MAX_HEIGHT = 200

interface ChatProps {
  postId?: string
  chatId?: string
  stableOnChatboxHeightChange?: (height: number) => void
}

const useCanCreateChat = (postId?: string, chatId?: string) => {
  const { data: messages } = useMessages(chatId)
  return postId && chatId && messages && messages.length > 0
}

export function Chatbox({
  postId,
  chatId,
  stableOnChatboxHeightChange,
}: ChatProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const divRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(24)
  const [value, setValue] = useState('')
  const { data: messages } = useMessages(chatId)
  const { mutate: runPrompt, isLoading } = usePrompt(chatId)

  const { mutate: createChat } = useCreateChat()
  const canCreateChat = useCanCreateChat(postId, chatId)

  useEffect(() => {
    stableOnChatboxHeightChange?.(height)
  }, [stableOnChatboxHeightChange, height])

  const { can: canUse } = useCanExecuteActionForPost(
    PermissionAction.Use,
    postId,
  )

  useEffect(() => {
    if (canUse) {
      textareaRef.current?.focus()
    }
  }, [canUse, chatId])

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
      setHeight(divRef.current.scrollHeight)
    }
  }, [value, setHeight])

  const handleCreateChat = () => {
    if (!postId) return
    createChat(
      { postId },
      {
        onSuccess: () => {
          handleReset()
        },
      },
    )
  }

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

  const trackingDivValue = value.replace(/\n$/, '\n\u00A0')

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
  const handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(ev.target.value)
    if (!textareaRef.current) return

    const targetHeight =
      textareaRef.current.scrollHeight > MAX_HEIGHT
        ? MAX_HEIGHT
        : textareaRef.current.scrollHeight

    setHeight(targetHeight)
  }

  const handleReset = () => {
    setValue('')
    textareaRef.current?.focus()
  }

  const showSkeleton = !chatId

  return (
    <div className="mx-auto max-w-4xl ">
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
                  _.isNull(canUse) && 'cursor-not-allowed bg-blue-200',
                )}
                style={{ maxHeight: height, height }}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                value={value}
              />
              <div
                ref={divRef}
                // Keep this and use for debugging the shadow textarea
                // className="absolute left-0 right-0 top-[-220px] overflow-hidden bg-pink-50"
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
        <div>
          {showSkeleton ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <Button
              onClick={handleCreateChat}
              variant="outline"
              size="xs"
              className="mr-2"
              // Revisit this: Is it the right behavior?
              // https://www.notion.so/joiahq/Revisit-the-behaviour-of-the-disabled-new-chat-button-in-the-chatbox-f44da7d966754e439bd96e74bf564a60
              disabled={!canCreateChat}
            >
              <DocumentIcon className="-ml-0.5 mr-1 h-3 w-3" /> New chat
            </Button>
          )}
        </div>
        {showSkeleton ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          <div className="text-zinc-400">
            <span className="font-semibold">Shift + Enter</span>
            &nbsp;to add a new line
          </div>
        )}
      </div>
    </div>
  )
}
