import { cn } from '@/lib/utils'
import { Author } from '@/shared/aiTypesAndMappers'
import { Fragment, useEffect, useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

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
          'prose max-w-none text-zinc-900',
          author === Author.Assistant && 'rounded bg-zinc-100/50 p-2 lg:p-4',
        )}
      >
        {author === Author.User && <>{formattedMessage}</>}
        {author !== Author.User && (
          <ReactMarkdown remarkPlugins={[]}>{message || ''}</ReactMarkdown>
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
