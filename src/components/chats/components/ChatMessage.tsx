import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

const wrapperCv = cva('space-y-1 rounded bg-white', {
  variants: {
    variant: {
      user: 'bg-zinc-100/0 border-zinc-400 border-l-0',
      assistant: 'p-3 bg-zinc-100/50 border-blue-100/40 border-l-0',
    },
  },
  defaultVariants: {
    variant: 'user',
  },
})

const authorCv = cva('font-bold tracking-tight', {
  variants: {
    variant: {
      user: 'text-black',
      assistant: 'text-black',
    },
  },
  defaultVariants: {
    variant: 'user',
  },
})
// Todo: reimplement "prose" manually for more control. Remove Tw typography plugin
const bodyCv = cva('prose max-w-none  text-zinc-900', {
  variants: {
    variant: {
      user: 'leading-relaxed space-y-3',
      assistant: 'leading-relaxed space-y-3',
    },
  },
  defaultVariants: {
    variant: 'user',
  },
})

interface ChatMessageProps {
  variant: 'user' | 'assistant'
  author: string
  message: string
}

// Todo: Add remarkPlugins if needed
export function ChatMessage({ author, message, variant }: ChatMessageProps) {
  const [hasRendered, setHasRendered] = useState(false)

  useEffect(() => {
    if (hasRendered) return
    setHasRendered(true)
  }, [hasRendered])

  return (
    <div
      className={cn(
        'translate-y-3 transform opacity-0 transition duration-300 ease-in-out',
        hasRendered && 'translate-y-0 opacity-100',
      )}
    >
      <div className={cn('mb-1', authorCv({ variant }))}>{author}</div>
      <div className={cn(wrapperCv({ variant }))}>
        <div className={cn(bodyCv({ variant }))}>
          <ReactMarkdown remarkPlugins={[]}>{message || ''}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
