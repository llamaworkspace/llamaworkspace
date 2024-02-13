import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

const wrapperCv = cva(
  'space-y-1 p-3 rounded bg-white  transition transform duration-200 ease-in-out opacity-0 translate-y-3',
  {
    variants: {
      variant: {
        default: 'bg-zinc-100/80 border-zinc-400 border-l-4',
        green: 'bg-openai-mid/10 border-openai-mid border-l-4',
        wizard: 'bg-sand-lightest border-sand-mid border-l-4 mb-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const authorCv = cva('font-bold tracking-tight', {
  variants: {
    variant: {
      default: 'text-black',
      green: 'text-openai-dark',
      wizard: 'text-zinc-400 hidden',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
// Todo: reimplement "prose" manually for more control. Remove Tw typography plugin
const bodyCv = cva('prose max-w-none space-y-6 leading-relaxed text-zinc-900', {
  variants: {
    variant: {
      default: '',
      green: '',
      wizard: 'text-zinc-700',
    },
  },
  defaultVariants: {
    variant: 'default',
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
    <div
      className={cn(
        wrapperCv({ variant }),
        hasRendered && 'translate-y-0 opacity-100',
      )}
    >
      <div className={cn(authorCv({ variant }))}>{author}</div>
      <div className={cn(bodyCv({ variant }))}>
        <ReactMarkdown remarkPlugins={[]}>{message || ''}</ReactMarkdown>
      </div>
    </div>
  )
}
