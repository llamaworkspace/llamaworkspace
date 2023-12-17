import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DefaultInputProps } from './formTypes'
import { FormFieldWrapper } from './FormFieldWrapper'

interface InputOptionProps {
  value: string
  label: string
}

// Keep value and onChange in here for compatibility with shadcnui Select
interface SelectFieldProps extends DefaultInputProps {
  value?: string
  placeholder?: string
  disabled?: boolean
  onChange: (value: string) => void
  onValueChange?: (value: string) => void
  options: InputOptionProps[]
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

  return (
    <FormFieldWrapper label={label} helperText={helperText}>
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        {...selectProps}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  )
}
