import { CheckIcon } from '@radix-ui/react-icons'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as React from 'react'

import { cn } from '@/lib/utils'

const BoxedRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  )
})
BoxedRadioGroup.displayName = 'BoxedRadioGroup'

const BoxedRadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <div>
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn('text-left', className)}
        {...props}
      >
        <div className="flex gap-x-2">
          <div className="min-w-5 pt-1">
            <div className="border-primary text-primary focus-visible:ring-ring aspect-square h-4 w-4 rounded-full border shadow focus:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50">
              <RadioGroupPrimitive.Indicator>
                <CheckIcon className="fill-primary h-3.5 w-3.5" />
              </RadioGroupPrimitive.Indicator>
            </div>
          </div>
          <div>{children}</div>
        </div>
      </RadioGroupPrimitive.Item>
    </div>
  )
})

BoxedRadioGroupItem.displayName = 'BoxedRadioGroupItem'

export { BoxedRadioGroup, BoxedRadioGroupItem }
