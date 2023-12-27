import { forwardRef } from 'react'
import { Input } from '../input'
import { FormFieldWrapper } from './FormFieldWrapper'
import type { DefaultInputProps } from './formTypes'

type InputProps = DefaultInputProps &
  React.InputHTMLAttributes<HTMLInputElement>

export const InputField = forwardRef<HTMLInputElement, InputProps>(
  function InputFieldFunc(
    {
      label,
      placeholder,
      helperText,
      onValueChange,
      required: isRequired,
      ...input
    },
    externalRef,
  ) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      input.onChange?.(e)

      if (onValueChange) {
        onValueChange(value)
      }
    }
    return (
      <FormFieldWrapper
        label={label}
        helperText={helperText}
        required={isRequired}
      >
        <Input
          ref={externalRef}
          {...input}
          onChange={handleChange}
          placeholder={placeholder}
        />
      </FormFieldWrapper>
    )
  },
)
