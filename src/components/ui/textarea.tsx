import * as React from 'react'

import { cn } from '@/lib/utils'

const baseClasses =
  'flex min-h-[60px] w-full rounded-md border border-zinc-200 bg-transparent p-3 shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-none focus-visible:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50  dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300 leading-relaxed'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea className={cn(baseClasses, className)} ref={ref} {...props} />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
