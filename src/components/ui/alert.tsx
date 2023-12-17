import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from './button'

const alertVariants = cva(
  'rounded-lg border px-4 py-3 text-sm relative w-full flex items-center justify-between gap-x-2',
  {
    variants: {
      variant: {
        default:
          'bg-white text-zinc-950 border-zinc-200 dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800',
        warning:
          'bg-yellow-50 text-yellow-900 border-yellow-400 dark:bg-zinc-950 dark:text-zinc-50',
        fuchsia:
          'bg-fuchsia-50/50 border-fuchsia-200 dark:bg-zinc-950 dark:text-zinc-50',
        destructive:
          'border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500 dark:border-red-900/50 dark:text-red-900 dark:dark:border-red-900 dark:[&>svg]:text-red-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, children, ...props }, ref) => {
  let rightButton = null
  const nextChildren = React.Children.toArray(children).filter((child) => {
    const isRightAlertButton =
      React.isValidElement(child) &&
      (child.type as React.ComponentType<unknown>).displayName ===
        'AlertRightButton'

    if (isRightAlertButton) {
      rightButton = child
    }
    return !isRightAlertButton
  })

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <div className="[&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-zinc-950 dark:[&>svg]:text-zinc-50 [&>svg~*]:pl-7">
        {nextChildren}
      </div>
      <div>{rightButton}</div>
    </div>
  )
})
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export const AlertRightButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, variant = 'secondary', ...props }, ref) => (
  <Button
    variant={variant}
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))

AlertRightButton.displayName = 'AlertRightButton'

export { Alert, AlertDescription, AlertTitle }
