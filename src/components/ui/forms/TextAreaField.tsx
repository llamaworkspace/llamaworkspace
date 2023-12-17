import { Textarea } from '@/components/ui/textarea'
import type { DefaultInputProps } from './formTypes'
import { FormFieldWrapper } from './FormFieldWrapper'
import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

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
