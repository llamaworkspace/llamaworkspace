import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

const wrapperCv = cva(
  'space-y-1 rounded bg-white transition transform duration-200 ease-in-out translate-y-3',
  {
    variants: {
      variant: {
        user: 'bg-zinc-100/0 border-zinc-400 border-l-0',
        assistant: 'p-3 bg-zinc-100/50 border-blue-100/40 border-l-0',
        wizard: 'p-4 bg-sand-lightest border-sand-mid border mb-6 opacity-20',
      },
    },
    defaultVariants: {
      variant: 'user',
    },
  },
)

const authorCv = cva('font-bold tracking-tight', {
  variants: {
    variant: {
      user: 'text-black',
      assistant: 'text-black',
      wizard: 'hidden',
    },
  },
  defaultVariants: {
    variant: 'user',
  },
})
// Todo: reimplement "prose" manually for more control. Remove Tw typography plugin
const bodyCv = cva('prose max-w-none space-y-3', {
  variants: {
    variant: {
      user: 'leading-relaxed text-zinc-900',
      assistant: 'leading-relaxed text-zinc-900',
      wizard: 'leading-normal text-zinc-900/80',
    },
  },
  defaultVariants: {
    variant: 'user',
  },
})

interface ChatMessageProps extends VariantProps<typeof wrapperCv> {
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
    <div>
      <div className={cn('mb-1', authorCv({ variant }))}>{author}</div>
      <div
        className={cn(
          wrapperCv({ variant }),
          hasRendered && 'translate-y-0 opacity-100',
        )}
      >
        <div className={cn(bodyCv({ variant }))}>
          <ReactMarkdown remarkPlugins={[]}>{message || ''}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
