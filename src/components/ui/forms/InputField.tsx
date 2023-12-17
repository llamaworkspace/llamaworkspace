import { forwardRef } from 'react'
import { Input } from '../input'
import { FormFieldWrapper } from './FormFieldWrapper'
import type { DefaultInputProps } from './formTypes'

type MyProps = DefaultInputProps & React.InputHTMLAttributes<HTMLInputElement>

export const InputField = forwardRef<HTMLInputElement, MyProps>(
  function InputFieldFunc(
    { label, placeholder, helperText, onValueChange, ...input },
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
      <FormFieldWrapper label={label} helperText={helperText}>
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
