import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { FormFieldWrapper } from './FormFieldWrapper'
import type { DefaultInputProps } from './formTypes'

interface TextAreaProps extends DefaultInputProps {
  initialValue?: string
  className?: string
  rows?: number
  disabled?: boolean
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextAreaFieldFunc(
    {
      label,
      placeholder,
      helperText,
      className,
      rows,
      disabled,
      ...textAreaProps
    },
    externalRef,
  ) {
    const finalClassNames = cn(disabled && 'bg-zinc-100', className)

    return (
      <FormFieldWrapper label={label} helperText={helperText}>
        <Textarea
          placeholder={placeholder}
          ref={externalRef}
          className={finalClassNames}
          rows={rows}
          disabled={disabled}
          {...textAreaProps}
        />
      </FormFieldWrapper>
    )
  },
)
