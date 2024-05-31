import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { FormFieldWrapper } from './FormFieldWrapper'
import type { DefaultFormInputProps } from './formTypes'

interface TextAreaProps extends DefaultFormInputProps {
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
      meta,
      ...textAreaProps
    },
    externalRef,
  ) {
    const finalClassNames = cn(disabled && 'bg-zinc-100', className)
    const error = meta && meta.submitFailed ? (meta.error as string) : undefined

    return (
      <FormFieldWrapper label={label} helperText={helperText} error={error}>
        <Textarea
          placeholder={placeholder}
          ref={externalRef}
          className={finalClassNames}
          rows={rows}
          disabled={disabled}
          colorScheme={error ? 'danger' : 'default'}
          {...textAreaProps}
        />
      </FormFieldWrapper>
    )
  },
)
