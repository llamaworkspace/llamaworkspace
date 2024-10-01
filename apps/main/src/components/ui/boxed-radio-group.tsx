import { CheckIcon } from '@radix-ui/react-icons'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as React from 'react'

import { cn } from '@/lib/utils'

export interface BoxedRadioGroupOption {
  value: string
  title: string
  description?: string
}

export interface BoxedRadioGroupProps {
  options: BoxedRadioGroupOption[]
  onValueChange?: (value: string) => void
  className?: string
  colorScheme?: 'default' | 'danger'
}

const BoxedRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  BoxedRadioGroupProps
>(({ className, options, colorScheme, ...props }, ref) => {
  const [value, setValue] = React.useState<string>()

  colorScheme = colorScheme ?? 'default'

  const handleChange = (value: string) => {
    setValue(value)
    props.onValueChange?.(value)
  }

  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      value={value}
      onValueChange={handleChange}
      ref={ref}
    >
      <div>
        {options.map((option, index) => {
          const nextOption = options[index + 1]
          const isFirst = index === 0
          const isLast = index === options.length - 1
          const isSelected = option.value === value
          const isNextSelected = nextOption && nextOption.value === value

          return (
            <BoxedRadioGroupItem
              value={option.value}
              key={option.title}
              className={cn(
                'w-full cursor-pointer border-x p-4',
                colorScheme === 'danger' && 'border-x-red-600',
                !isNextSelected && 'border-b',
                isFirst && 'rounded-t-md border-t',
                isLast && 'rounded-b-md',
                isFirst && colorScheme === 'danger' && 'border-t-red-600',
                isLast && colorScheme === 'danger' && 'border-b-red-600',
                isSelected && 'border-t',
                isSelected && colorScheme === 'danger' && 'bg-red-50',
                isSelected && colorScheme !== 'danger' && 'bg-zinc-100',
                isSelected && colorScheme === 'danger' && 'border-red-600',
                isSelected && colorScheme !== 'danger' && 'border-zinc-600',
              )}
            >
              <div>
                <div className="font-semibold">{option.title}</div>
                <div className="text-sm text-zinc-600">
                  {option.description}
                </div>
              </div>
            </BoxedRadioGroupItem>
          )
        })}
      </div>
    </RadioGroupPrimitive.Root>
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
            <div className="text-primary focus-visible:ring-ring aspect-square h-4 w-4 rounded-full border border-zinc-200 shadow focus:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50">
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
