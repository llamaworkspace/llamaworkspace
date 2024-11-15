import Markdown from '@/components/ui/markdown/markdown'
import { cn } from '@/lib/utils'
import { Author } from '@/shared/aiTypesAndMappers'
import { Fragment, useEffect, useMemo, useRef } from 'react'

interface ChatMessageProps {
  author: Author.User | Author.Assistant
  message: string
  onLineHeightChange?: (height: number) => void
}

// Todo: Add remarkPlugins if needed
export function ChatMessage({
  author,
  message,
  onLineHeightChange,
}: ChatMessageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const divElHeight = useRef(0)

  useEffect(() => {
    if (ref.current && onLineHeightChange) {
      if (divElHeight.current !== ref.current.scrollHeight) {
        onLineHeightChange(ref.current.scrollHeight)
      }
      divElHeight.current = ref.current.scrollHeight
    }
  }, [message, onLineHeightChange])

  const formattedMessage = useMemo(() => {
    if (author !== Author.User) return null
    return messageWithLineBreaks(message)
  }, [message, author])

  const authorValue = author === Author.User ? 'You' : 'Assistant'

  return (
    <div ref={ref} className="space-y-1">
      <div className="font-bold tracking-tight text-zinc-950">
        {authorValue}
      </div>
      <div
        className={cn(
          'prose prose-zinc max-w-none text-zinc-950',
          author === Author.User && 'rounded bg-zinc-100/50 p-2 lg:p-4',
        )}
      >
        {author === Author.User && <>{formattedMessage}</>}
        {author === Author.Assistant && (
          <>
            {!message.length && (
              <div className="animate-blink text-xl text-zinc-600">
                &#10073;
              </div>
            )}
            {!!message.length && <Markdown content={message || ''} />}
          </>
        )}
      </div>
    </div>
  )
}

const messageWithLineBreaks = (message: string) => {
  return message.split('\n').map((line, index) => {
    return (
      <Fragment key={index}>
        {line}
        <br />
      </Fragment>
    )
  })
}
