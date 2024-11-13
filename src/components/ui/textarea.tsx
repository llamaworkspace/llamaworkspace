import { cn } from '@/lib/utils'
import type { VariantProps, cva } from 'class-variance-authority'
import { forwardRef } from 'react'

const inputVariants = cva('', {
  variants: {
    variant: {
      default:
        'flex min-h-[60px] w-full rounded-md border bg-transparent p-3 shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-none focus-visible:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50  dark:placeholder:text-zinc-400 leading-relaxed',
      unstyled: '',
    },
    colorScheme: {
      default:
        'border-zinc-200 text-zinc-900 dark:text-zinc-50 focus-visible:ring-zinc-950 dark:border-zinc-800  dark:focus-visible:ring-zinc-300',
      danger:
        'border-red-600 text-zinc-900 dark:text-red-50 focus-visible:ring-red-950 dark:border-red-800 dark:focus-visible:ring-red-300',
    },
  },
  defaultVariants: {
    variant: 'default',
    colorScheme: 'default',
  },
})

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, colorScheme, ...props }, ref) => {
    return (
      <textarea
        className={cn(inputVariants({ variant, colorScheme }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
