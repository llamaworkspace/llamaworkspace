import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectTriggerVariantProps,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import { FormFieldWrapper } from './FormFieldWrapper'
import type { DefaultInputProps } from './formTypes'

interface InputOptionProps {
  value: string
  label: string
  disabled?: boolean
}

// Keep value and onChange in here for compatibility with shadcnui Select
export interface SelectFieldProps extends DefaultInputProps {
  options: InputOptionProps[]
  onChange: (value: string) => void
  onValueChange?: (value: string) => void
  value?: string
  placeholder?: string
  disabled?: boolean
  variant?: SelectTriggerVariantProps['variant']
  emptyStateContent?: React.FC
}

export const SelectField = ({
  value,
  onChange,
  onValueChange, //Alternative to react to changes after onChange
  options,
  placeholder,
  label,
  helperText,
  disabled,
  variant,
  emptyStateContent,
  ...selectProps
}: SelectFieldProps) => {
  // Necessary as otherwise the placeholder does not work
  if (value === '') {
    value = undefined
  }

  const handleValueChange = (value: string) => {
    onChange(value)
    setTimeout(() => {
      onValueChange?.(value)
    }, 0)
  }

  const EmptyStateContent = emptyStateContent ?? (() => null)

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value)
  }, [options, value])

  const selectedIsDisabled = selectedOption?.disabled

  return (
    <FormFieldWrapper label={label} helperText={helperText}>
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        {...selectProps}
      >
        <SelectTrigger
          variant={variant}
          className={cn(selectedIsDisabled && 'text-zinc-400')}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 && <EmptyStateContent />}
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  )
}
