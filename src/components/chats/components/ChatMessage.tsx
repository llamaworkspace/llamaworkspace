import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

const wrapperCv = cva('space-y-1 rounded bg-white', {
  variants: {
    variant: {
      user: 'bg-zinc-100/0 border-zinc-400 border-l-0',
      assistant: 'p-3 bg-zinc-100/50 border-blue-100/40 border-l-0',
      wizard:
        'p-4 border rounded-lg border-zinc-200 border-2 mb-6 bg-zinc-100/40 max-w-[80%] mx-auto text-center',
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
      wizard: 'hidden',
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
      wizard: 'text-zinc-700 space-y-2 leading-normal tracking-tight',
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

  if (variant === 'wizard') {
    return (
      <div className="flex h-full items-center ">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-5xl">🥶</div>
            <div className="text-3xl font-bold tracking-tighter text-zinc-900">
              Blog posts fine-tuner
            </div>
          </div>
          <div className="max-w-3xl space-y-4 text-zinc-700">
            <ReactMarkdown remarkPlugins={[]}>{message || ''}</ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

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
