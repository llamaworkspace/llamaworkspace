import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  variant: 'user' | 'assistant'
  author: string
  message: string
}

// Todo: Add remarkPlugins if needed
export function ChatMessage({ author, message, variant }: ChatMessageProps) {
  return (
    <div className="space-y-1">
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
