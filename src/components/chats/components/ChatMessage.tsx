import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  variant: 'user' | 'assistant'
  author: string
  message: string
  onLineHeightChange?: (height: number) => void
}

// Todo: Add remarkPlugins if needed
export function ChatMessage({
  author,
  message,
  variant,
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

  return (
    <div ref={ref} className="space-y-1">
      <div className="font-bold tracking-tight text-black">{author}</div>
      <div
        className={cn(
          'prose max-w-none text-zinc-900',
          variant === 'assistant' && 'rounded bg-zinc-100/50 p-2 lg:p-4',
        )}
      >
        <ReactMarkdown remarkPlugins={[]}>{message || ''}</ReactMarkdown>
      </div>
    </div>
  )
}
