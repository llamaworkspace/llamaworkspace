import { cn, mergeRefs } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, useEffect, useRef } from 'react'

const inputVariants = cva('', {
  variants: {
    variant: {
      default:
        'flex h-9 w-full rounded-md border bg-transparent px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-400 text-sm',
      unstyled: '',
    },
    colorScheme: {
      default:
        'border-zinc-200 text-zinc-900 dark:text-zinc-50 focus-visible:ring-zinc-950 dark:border-zinc-800  dark:focus-visible:ring-zinc-300',
      danger:
        'border-red-600 text-zinc-900 dark:text-red-50 focus-visible:ring-red-600 dark:border-red-800 dark:focus-visible:ring-red-300',
    },
  },
  defaultVariants: {
    variant: 'default',
    colorScheme: 'default',
  },
})

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
  VariantProps<typeof inputVariants> {
  onEnterKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  focusOnMount?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      onEnterKeyDown,
      focusOnMount,
      variant,
      colorScheme,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
      if (focusOnMount && internalRef.current) {
        internalRef.current.focus()
      }
    }, [focusOnMount])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      props.onKeyDown?.(event)

      if (
        event.key === 'Enter' &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        onEnterKeyDown?.(event)
      }
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, colorScheme }), className)}
        ref={mergeRefs([internalRef, ref])}
        {...props}
        onKeyDown={handleKeyDown}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
